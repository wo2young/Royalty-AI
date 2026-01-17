import os
import torch
from torchvision import models, transforms
from sentence_transformers import SentenceTransformer
from PIL import Image
import numpy as np

class BrandAnalyzer:
    def __init__(self):
        # 1. 모델 경로 설정 (상위 폴더의 models 폴더)
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_save_dir = os.path.join(base_dir, "models")
        
        if not os.path.exists(model_save_dir):
            os.makedirs(model_save_dir)

        print(f"⏳ i3 최적화 모델 로딩 중... ({model_save_dir})")

        # 2. 이미지 엔진 (ResNet50) - 오직 벡터 추출용
        torch.hub.set_dir(model_save_dir)
        # i3를 위해 가벼운 가중치 로딩
        self.img_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.img_model.eval()
        
        # 이미지 전처리 (이 규격이 틀리면 검색 정확도가 떨어집니다)
        self.img_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

        # 3. 텍스트 엔진 (Ko-SBERT) - 768차원 고정
        self.txt_model = SentenceTransformer(
            'jhgan/ko-sroberta-multitask', 
            cache_folder=model_save_dir
        )
        print("✅ [심장부] 텍스트/이미지 임베딩 엔진 준비 완료!")

    def get_text_vector(self, text):
        """단일 텍스트를 768차원 벡터로 변환 (검색 시 사용)"""
        return self.txt_model.encode(text)

    def get_text_vectors_batch(self, text_list):
        """신규 데이터 자동화 업데이트 시 사용 (배치 처리)"""
        return self.txt_model.encode(text_list, batch_size=64, show_progress_bar=False)

    def get_image_vector(self, image_path):
        """단일 이미지 파일을 1000차원 벡터로 변환 (이미지 검색 시 사용)"""
        try:
            user_img = Image.open(image_path).convert('RGB')
            user_img = self.img_transform(user_img).unsqueeze(0)
            with torch.no_grad():
                # 마지막 레이어 통과 후 1000차원 벡터 생성
                vec = self.img_model(user_img).flatten().numpy()
            return vec
        except Exception as e:
            print(f"❌ 이미지 처리 실패: {image_path} | 사유: {e}")
            return np.zeros(1000) # 실패 시 0벡터 반환

    def get_image_vectors_batch(self, image_paths):
        """신규 이미지들 대량 처리용"""
        return [self.get_image_vector(path) for path in image_paths]