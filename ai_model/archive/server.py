from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from src.analyzer import BrandAnalyzer # 아까 만든 클래스

app = FastAPI()
analyzer = BrandAnalyzer()

# 자바에서 보낼 요청 규격
class SimilarityRequest(BaseModel):
    user_image_path: str        # 사용자가 업로드한 로고 경로
    user_text: str             # 사용자가 입력한 브랜드명
    target_image_vector: List[float] # DB에서 꺼낸 기존 상표 이미지 벡터
    target_text_vector: List[float]  # DB에서 꺼낸 기존 상표 이름 벡터

@app.post("/analyze")
async def analyze(request: SimilarityRequest):
    try:
        # 1. 자바에서 넘겨준 리스트를 넘파이 배열로 변환 (모델 연산용)
        target_img_vec = np.array(request.target_image_vector, dtype=np.float32)
        target_txt_vec = np.array(request.target_text_vector, dtype=np.float32)

        # 2. 이미지 유사도 점수 추출
        img_score = analyzer.get_image_similarity(request.user_image_path, target_img_vec)
        
        # 3. 텍스트 유사도 점수 추출
        txt_score = analyzer.get_text_similarity(request.user_text, target_txt_vec)

        # 4. 자바에게 각각의 점수 반환
        return {
            "image_score": round(img_score, 4),
            "text_score": round(txt_score, 4)
        }
    except Exception as e:
        print(f"❌ 분석 에러: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)