from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from analyzer import BrandAnalyzer
from daily_pipeline import DailyAutomation
from typing import Optional
import uvicorn
import shutil
import os

app = FastAPI(title="Royalty AI Model Server")

analyzer = BrandAnalyzer()
automation = DailyAutomation(analyzer_instance=analyzer)

@app.post("/api/v1/search/hybrid")
async def search_hybrid(
    query_text: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None)
):
    if not query_text and not file:
        raise HTTPException(status_code=400, detail="텍스트나 이미지 중 하나는 필수입니다.")

    temp_path = None
    try:
        text_vec = None
        if query_text:
            text_vec = analyzer.get_text_vector(query_text)
        
        img_vec = None
        if file:
            temp_path = f"temp_search_{file.filename}"
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            img_vec = analyzer.get_image_vector(temp_path)

        # 1. DB에서 후보군 150개(텍스트50 + 이미지50 + 키워드50) 추출
        candidates = automation.get_candidates_from_db(text_vec, img_vec, query_text=query_text)

        if not candidates:
            return {"status": "success", "results": [], "message": "No candidates found"}

        # 2. 하이브리드 재정렬 수행 (이제 30개를 반환하며, 이미지 URL과 카테고리 코드가 포함됨)
        final_results = analyzer.calculate_hybrid_score(query_text, candidates, img_vec)

        return {"status": "success", "results": final_results}

    except Exception as e:
        print(f" 검색 에러: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)