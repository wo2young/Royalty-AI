import os
import torch
from torchvision import models, transforms
from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
import Levenshtein

class BrandAnalyzer:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_save_dir = os.path.join(base_dir, "models")
        if not os.path.exists(model_save_dir): os.makedirs(model_save_dir)

        self.img_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.img_model.eval()
        self.img_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self.txt_model = SentenceTransformer('jhgan/ko-sroberta-multitask', cache_folder=model_save_dir)

    def get_text_vector(self, text):
        return self.txt_model.encode(text)

    def get_image_vector(self, image_path):
        try:
            user_img = Image.open(image_path).convert('RGB')
            user_img = self.img_transform(user_img).unsqueeze(0)
            with torch.no_grad():
                vec = self.img_model(user_img).flatten().numpy()
            return vec
        except:
            return np.zeros(1000)

    def calculate_hybrid_score(self, query_text, db_results, query_img_vec=None):
        safe_query_text = query_text if query_text else ""

        # 가중치 설정
        if safe_query_text and query_img_vec is not None:
            W_IMG, W_SBERT, W_SPELL = 0.4, 0.3, 0.3
        elif query_img_vec is not None:
            W_IMG, W_SBERT, W_SPELL = 1.0, 0.0, 0.0
        else:
            W_IMG, W_SBERT, W_SPELL = 0.0, 0.2, 0.8

        final_candidates = []
        
        # [변경] 중복 제거 로직(seen_names) 삭제 
        # -> 백엔드에서 카테고리별로 처리할 수 있도록 모든 데이터 허용

        for item in db_results:
            db_name = item.get('trademark_name', '').strip()

            if len(db_name) < 1 or db_name.lower() in ['n', 'null', 'none']:
                continue

            # 유사도 계산 로직
            v_sim = float(item.get('visual_sim', 0.0))
            raw_t_sim = float(item.get('text_sim', 0.0))
            t_sim = raw_t_sim ** 2
            
            if not safe_query_text:
                spell_sim = 0.0
            else:
                dist = Levenshtein.distance(safe_query_text, db_name)
                max_len = max(len(safe_query_text), len(db_name))
                spell_sim = 1.0 - (dist / max_len) if max_len > 0 else 0.0
                if safe_query_text in db_name: spell_sim += 0.1

            score = (v_sim * W_IMG) + (t_sim * W_SBERT) + (spell_sim * W_SPELL)
            if safe_query_text and spell_sim == 1.0: score += 0.2

            # [핵심] 결과 구성: 이미지 URL과 카테고리 정보를 함께 리턴
            final_candidates.append({
                "id": item.get('id'),
                "name": db_name,
                "image_url": item.get('image_url', ''), # 텍스트 검색 시에도 이미지 URL 포함
                "category": item.get('category', ''), # 백엔드 필터링용
                "score": round(score, 4),
                "details": {
                    "v": round(v_sim, 3), 
                    "t": round(t_sim, 3), 
                    "s": round(spell_sim, 3)
                }
            })

        # 점수 높은 순으로 정렬
        final_candidates.sort(key=lambda x: x['score'], reverse=True)

        # [변경] 상위 30개 리턴
        return final_candidates[:30]