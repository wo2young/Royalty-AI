import os
import torch
from torchvision import models, transforms
from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

class BrandAnalyzer:
    def __init__(self):
        # 1. 모델 저장 경로 설정 (ai_model/models)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_save_dir = os.path.join(base_dir, "models")
        
        if not os.path.exists(model_save_dir):
            os.makedirs(model_save_dir)

        print(f"⏳ 모델 로딩 중... 저장위치: {model_save_dir}")

        # 2. 이미지 엔진 (ResNet50) - 경로 강제 지정
        torch.hub.set_dir(model_save_dir)
        self.img_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.img_model.eval()
        self.img_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # 3. 텍스트 엔진 (Ko-SBERT) - 경로 강제 지정
        self.txt_model = SentenceTransformer(
            'jhgan/ko-sroberta-multitask', 
            cache_folder=model_save_dir
        )
        print("✅ 모든 모델 준비 완료!")

    def get_image_similarity(self, user_img_path, target_img_vec):
        user_img = Image.open(user_img_path).convert('RGB')
        user_img = self.img_transform(user_img).unsqueeze(0)
        with torch.no_grad():
            user_img_vec = self.img_model(user_img).flatten().numpy()
        return float(cosine_similarity([user_img_vec], [target_img_vec])[0][0])

    def get_text_similarity(self, user_text, target_text_vec):
        user_txt_vec = self.txt_model.encode(user_text)
        return float(cosine_similarity([user_txt_vec], [target_text_vec])[0][0])
    
    def get_text_vectors_batch(self, text_list):
        """530만 개 처리를 위해 리스트를 통째로 받아 벡터 리스트로 반환"""
        # Ko-SBERT는 리스트를 넣으면 병렬로 계산합니다.
        vectors = self.txt_model.encode(text_list, batch_size=128, show_progress_bar=True)
        return vectors

    def get_image_vectors_batch(self, image_paths):
        """여러 이미지 경로를 받아 한꺼번에 벡터 추출"""
        # 이 부분은 나중에 Multi-processing과 결합해서 속도를 높일 겁니다.
        results = []
        for path in image_paths:
            results.append(self.get_image_vector(path))
        return np.array(results)

# ==========================================
# 실제 실행 부분 (이게 있어야 작동합니다!)
# ==========================================
if __name__ == "__main__":
    # 클래스를 생성하는 순간 __init__이 실행되면서 모델을 다운로드합니다.
    analyzer = BrandAnalyzer()