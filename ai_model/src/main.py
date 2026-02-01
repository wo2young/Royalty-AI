from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
import uvicorn
import io
import uuid
import os
import shutil
import psycopg2

# ✅ [중요] Pydantic 모델은 반드시 앱 초기화 전에 있어야 안전합니다.
from pydantic import BaseModel 

# 만든 모듈 임포트
from analyzer import BrandAnalyzer
from db_search import DBSearchEngine
from scheduler import TrademarkScheduler
from dotenv import load_dotenv

# .env 로드
load_dotenv()

# ✅ 테스트 데이터 입력용 데이터 구조 정의 (DTO)
class TestDataReq(BaseModel):
    trademark_name: str
    applicant: str
    status: str = "출원"
    application_number: str

app = FastAPI()

analyzer = None
search_engine = None
scheduler = None 

@app.on_event("startup")
async def startup_event():
    global analyzer, search_engine, scheduler
    print("🚀 Starting AI Engine...")
    
    analyzer = BrandAnalyzer()
    search_engine = DBSearchEngine()
    
    # 스케줄러 시작
    scheduler = TrademarkScheduler(analyzer)
    scheduler.start()
    
    print("✅ System Ready (AI + DB + Scheduler)")

# ========================================================
# 1. 하이브리드 검색 API
# ========================================================
@app.post("/api/v1/search/hybrid")
async def search_hybrid(
    query_text: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None)
):
    if not query_text and not file:
        raise HTTPException(status_code=400, detail="Input required")

    unique_filename = f"{uuid.uuid4()}_{file.filename}" if file else "temp.jpg"
    
    try:
        text_vec = None
        img_vec = None
        
        if query_text:
            text_vec = analyzer.get_text_vector(query_text)
        
        if file:
            with open(unique_filename, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            with open(unique_filename, "rb") as f:
                 img_vec = analyzer.get_image_vector(f)

        candidates = search_engine.get_candidates(text_vec, img_vec, query_text)

        if not candidates:
            return {"status": "success", "results": [], "message": "No candidates found"}

        final_results = analyzer.calculate_hybrid_score(query_text, candidates, img_vec)
        return {"status": "success", "results": final_results}

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        if file and os.path.exists(unique_filename):
            os.remove(unique_filename)


# ========================================================
# 2. [NEW] 알림 테스트용 데이터 강제 삽입 API
# ========================================================
@app.post("/api/v1/test/insert")
async def insert_test_data(data: TestDataReq):
    """
    임의의 상표 데이터를 DB에 강제로 넣어서
    백엔드/알림 시스템이 새로운 데이터를 감지하는지 테스트하는 용도
    """
    try:
        # 1. 텍스트 벡터 생성 (검색 및 알림 매칭을 위해 필수)
        text_vec = analyzer.get_text_vector(data.trademark_name)
        
        # 2. DB 삽입
        # search_engine에 있는 설정 재사용
        conn = psycopg2.connect(**search_engine.db_config)
        cur = conn.cursor()
        
        # patent 테이블 구조에 맞춰 INSERT
        cur.execute("""
            INSERT INTO patent (application_number, trademark_name, applicant, status, text_vector, image_url)
            VALUES (%s, %s, %s, %s, %s::vector, 'http://dummy.image/test.jpg')  
            RETURNING patent_id
        """, (
            data.application_number, 
            data.trademark_name, 
            data.applicant, 
            data.status, 
            text_vec.tolist()
        ))
        
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            "status": "success", 
            "message": f"Test data inserted successfully. ID: {new_id}",
            "data": data
        }

    except Exception as e:
        print(f"Insert Error: {e}")
        raise HTTPException(status_code=500, detail=f"DB Insert Failed: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)