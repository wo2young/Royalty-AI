import os
import torch
from torchvision.models import mobilenet_v3_large, MobileNet_V3_Large_Weights
from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
import Levenshtein
from jamo import h2j, j2hcj

class BrandAnalyzer:
    def __init__(self):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_save_dir = os.path.join(base_dir, "models")
        if not os.path.exists(model_save_dir): os.makedirs(model_save_dir)

        # 최적화
        if 'fbgemm' in torch.backends.quantized.supported_engines:
            torch.backends.quantized.engine = 'fbgemm'
        torch.set_num_threads(1) 

        # 1. 이미지 모델 (MobileNetV3 - 1280차원)
        print("Loading Image Model (MobileNetV3)...")
        weights = MobileNet_V3_Large_Weights.DEFAULT
        self.img_model = mobilenet_v3_large(weights=weights)
        # [중요] 1280차원 유지를 위해 마지막 레이어만 제거
        self.img_model.classifier = torch.nn.Sequential(
            self.img_model.classifier[0],
            self.img_model.classifier[1],
            self.img_model.classifier[2]
        )
        self.img_model.eval()
        self.img_transform = weights.transforms()

        # 2. 텍스트 모델 (SBERT - 768차원)
        print("Loading Text Model (Ko-SBERT)...")
        self.txt_model = SentenceTransformer('jhgan/ko-sroberta-multitask', cache_folder=model_save_dir)
        print("✅ AI Models Loaded.")

    def get_jamo_similarity(self, s1, s2):
        j1 = j2hcj(h2j(s1))
        j2 = j2hcj(h2j(s2))
        dist = Levenshtein.distance(j1, j2)
        max_len = max(len(j1), len(j2))
        return 1.0 - (dist / max_len) if max_len > 0 else 0.0

    def get_text_vector(self, text):
        if not text: return None
        return self.txt_model.encode(text)

    def get_image_vector(self, image_stream):
        try:
            user_img = Image.open(image_stream).convert('RGB')
            user_img = self.img_transform(user_img).unsqueeze(0)
            with torch.no_grad():
                return self.img_model(user_img).flatten().numpy()
        except:
            return np.zeros(1280)

    def calculate_hybrid_score(self, query_text, db_results, query_img_vec=None):
        safe_query_text = query_text if query_text else ""
        
        # 가중치 (이미지/텍스트 유무에 따라 유동적)
        if safe_query_text and query_img_vec is not None:
            W_IMG, W_SBERT, W_SPELL = 0.4, 0.3, 0.3
        elif query_img_vec is not None:
            W_IMG, W_SBERT, W_SPELL = 1.0, 0.0, 0.0
        else:
            W_IMG, W_SBERT, W_SPELL = 0.0, 0.2, 0.8

        final_candidates = []
        for item in db_results:
            db_name = item.get('trademark_name', '').strip()
            if not db_name: continue

            # DB에서 온 Raw 유사도
            raw_v_sim = float(item.get('visual_sim', 0.0))
            raw_t_sim = float(item.get('text_sim', 0.0))
            
            # 점수 스케일링
            v_sim = raw_v_sim ** 1.5
            t_sim = raw_t_sim ** 2

            # 파이썬 내부 연산 (자모/철자 유사도)
            jamo_sim = self.get_jamo_similarity(safe_query_text, db_name)
            dist = Levenshtein.distance(safe_query_text, db_name)
            max_len = max(len(safe_query_text), len(db_name))
            lev_sim = 1.0 - (dist / max_len) if max_len > 0 else 0.0
            spell_sim = max(lev_sim, jamo_sim)

            # 보너스 점수
            if safe_query_text:
                if db_name and j2hcj(h2j(safe_query_text))[0] == j2hcj(h2j(db_name))[0]:
                    spell_sim += 0.05
                if safe_query_text in db_name:
                    spell_sim += 0.1

            # 최종 가중 합산
            if jamo_sim > 0.8:
                score = (v_sim * W_IMG) + (t_sim * 0.05) + (spell_sim * 0.95) + 0.1
            else:
                score = (v_sim * W_IMG) + (t_sim * W_SBERT) + (spell_sim * W_SPELL)
            
            if safe_query_text and spell_sim >= 1.0: score += 0.2

            final_candidates.append({
                "id": item.get('id'),
                "name": db_name,
                "image_url": item.get('image_url', ''),
                "category": item.get('category', ''),
                "score": round(score, 4), # 최종 종합 점수
                "details": {
                    "v": round(v_sim, 3), # 시각 유사도
                    "t": round(t_sim, 3), # 텍스트 의미 유사도
                    "s": round(spell_sim, 3) # 철자 유사도
                }
            })
            
        final_candidates.sort(key=lambda x: x['score'], reverse=True)
        
        # [수정] 상위 30개 반환
        return final_candidates[:30]