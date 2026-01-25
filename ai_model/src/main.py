from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
import uvicorn
import io
import uuid
import os
import shutil
from analyzer import BrandAnalyzer
from db_search import DBSearchEngine

app = FastAPI()

analyzer = None
search_engine = None

@app.on_event("startup")
async def startup_event():
    global analyzer, search_engine
    print("🚀 Starting AI Engine...")
    analyzer = BrandAnalyzer()
    search_engine = DBSearchEngine()
    print("✅ System Ready (MobileNetV3-1280 + AWS RDS)")

@app.post("/api/v1/search/hybrid")
async def search_hybrid(
    query_text: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None)
):
    if not query_text and not file:
        raise HTTPException(status_code=400, detail="Input required")

    # 임시 파일 처리 (Pillow 호환성 위해)
    unique_filename = f"{uuid.uuid4()}_{file.filename}" if file else "temp.jpg"
    
    try:
        # 1. 벡터 추출
        text_vec = None
        img_vec = None
        
        if query_text:
            text_vec = analyzer.get_text_vector(query_text)
        
        if file:
            with open(unique_filename, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            with open(unique_filename, "rb") as f:
                 img_vec = analyzer.get_image_vector(f)

        # 2. AWS DB에서 후보 가져오기
        candidates = search_engine.get_candidates(text_vec, img_vec, query_text)

        if not candidates:
            return {"status": "success", "results": [], "message": "No candidates found"}

        # 3. Python에서 랭킹 매기기 (상위 50개)
        final_results = analyzer.calculate_hybrid_score(query_text, candidates, img_vec)

        # 4. 백엔드로 결과 반환
        return {"status": "success", "results": final_results}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file and os.path.exists(unique_filename):
            os.remove(unique_filename)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)