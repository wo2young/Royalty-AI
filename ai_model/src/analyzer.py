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
        # 한글 자모 분리 후 거리 계산
        j1 = j2hcj(h2j(s1))
        j2 = j2hcj(h2j(s2))
        dist = Levenshtein.distance(j1, j2)
        max_len = max(len(j1), len(j2))
        return 1.0 - (dist / max_len) if max_len > 0 else 0.0

        # [추가] 자모 분리 유사도 계산기
    def get_jamo_similarity(self, s1, s2):
        # 1. 자모 분리 (쌈성 -> ㅆㅏㅁㅅㅓㅇ)
        j1 = j2hcj(h2j(s1))
        j2 = j2hcj(h2j(s2))
        
        # 2. 자모 단위 편집 거리 계산
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
        # [수정 1] 입력값도 소문자로 변환
        safe_query_text = query_text.strip() if query_text else ""
        

        # 가중치 설정 로직 (기존과 동일)
        if safe_query_text and query_img_vec is not None:
            W_SPELL, W_IMG, W_SBERT = 0.4, 0.4, 0.2
        elif query_img_vec is not None:
            W_SPELL, W_IMG, W_SBERT = 0.0, 1.0, 0.0
        else:
            W_SPELL, W_IMG, W_SBERT = 0.8, 0.0, 0.2

        final_candidates = []
        for item in db_results:
            db_name = item.get('trademark_name', '').strip()
            if not db_name: continue

            v_sim = float(item.get('visual_sim', 0.0))
            t_sim = float(item.get('text_sim', 0.0))
            
            spell_sim = 0.0
            
            # [수정 2] 공백 제거 + 소문자 변환 (.lower() 추가!)
            # "SK" -> "sk", "Skin Tea" -> "skintea"
            clean_query = safe_query_text.replace(" ", "").lower()
            clean_db_name = db_name.replace(" ", "").lower()
            
            if clean_query:
                jamo_sim = self.get_jamo_similarity(clean_query, clean_db_name)
                
                dist = Levenshtein.distance(clean_query, clean_db_name)
                max_len = max(len(clean_query), len(clean_db_name))
                lev_sim = 1.0 - (dist / max_len) if max_len > 0 else 0.0
                
                spell_sim = max(lev_sim, jamo_sim)

            raw_score = (v_sim * W_IMG) + (t_sim * W_SBERT) + (spell_sim * W_SPELL)
            
            # 보너스/페널티 로직도 소문자 기준(clean_...)으로 비교
            if clean_query:
                if clean_query in clean_db_name:
                    if clean_db_name.startswith(clean_query):
                        raw_score += 0.05
                else:
                    raw_score *= 0.5
            
            # 완전 일치도 소문자 기준으로 판단 (SK == sk)
            if clean_query == clean_db_name:
                raw_score = 1.0

            final_score = min(raw_score, 1.0)

            final_candidates.append({
                "id": item.get('id'),
                "name": db_name, # 원래 이름(대소문자 유지)으로 반환
                "image_url": item.get('image_url', ''),
                "category": item.get('category', ''),
                "score": round(final_score, 4), 
                "details": {
                    "v": round(v_sim, 3), 
                    "t": round(t_sim, 3), 
                    "s": round(spell_sim, 3) 
                }
            })
            
        final_candidates.sort(key=lambda x: x['score'], reverse=True)
        
        return final_candidates[:30]
