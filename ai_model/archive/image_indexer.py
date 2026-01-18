import os
import torch
from torchvision import models, transforms
from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
import Levenshtein

class BrandAnalyzer:
    def __init__(self):
        # 인덱싱 코드와 동일한 모델 세팅
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_save_dir = os.path.join(base_dir, "models")
        
        # 1. 1000차원 벡터 추출을 위한 원본 ResNet50 (인덱싱 때와 동일)
        self.img_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.img_model.eval()
        
        # 2. 인덱싱 코드에서 사용한 것과 동일한 전처리
        self.img_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        self.txt_model = SentenceTransformer('jhgan/ko-sroberta-multitask', cache_folder=model_save_dir)

    def get_image_vector(self, image_path):
        """인덱싱 코드의 핵심 로직을 검색용으로 이식"""
        try:
            img = Image.open(image_path).convert('RGB')
            # 인덱싱 코드와 100% 동일한 텐서 변환
            img_tensor = self.img_transform(img).unsqueeze(0)
            with torch.no_grad():
                # 인덱싱 때와 동일하게 flatten()하여 1000차원 추출
                img_vec = self.img_model(img_tensor).flatten().numpy()
            return img_vec
        except Exception as e:
            print(f"❌ 검색 이미지 임베딩 실패: {e}")
            return np.zeros(1000)

    def calculate_hybrid_score(self, query_text, db_results, query_img_vec=None):
        """
        인덱싱된 데이터를 바탕으로 최종 랭킹 계산
        W_SPELL을 0.3으로 낮추고 의미(SBERT)와 시각(IMG) 비중을 높여 하이브리드 효과 극대화
        """
        W_IMG = 0.4 if query_img_vec is not None else 0.0
        W_SBERT = 0.3 if query_img_vec is not None else 0.5
        W_SPELL = 0.3 if query_img_vec is not None else 0.5

        final_candidates = []
        for item in db_results:
            v_sim = float(item.get('visual_sim', 0.0))
            
            # SBERT 점수가 촘촘하므로 제곱하여 변별력 확보
            raw_t_sim = float(item.get('text_sim', 0.0))
            t_sim = raw_t_sim ** 2 
            
            db_name = item.get('trademark_name', '')
            dist = Levenshtein.distance(query_text, db_name)
            max_len = max(len(query_text), len(db_name))
            spell_sim = 1.0 - (dist / max_len) if max_len > 0 else 0.0

            # 최종 점수 합산
            score = (v_sim * W_IMG) + (t_sim * W_SBERT) + (spell_sim * W_SPELL)

            # 이름이 토씨 하나 안 틀리고 같으면 상단 고정 (가산점)
            if spell_sim == 1.0:
                score += 0.2

            final_candidates.append({
                "id": item['id'],
                "score": round(score, 4),
                "name": db_name,
                "detail": {"visual": round(v_sim, 3), "text": round(t_sim, 3), "spell": round(spell_sim, 3)}
            })

        final_candidates.sort(key=lambda x: x['score'], reverse=True)
        return final_candidates[:10]