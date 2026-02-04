from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from typing import Optional
import uvicorn
import io
import uuid
import os
import shutil
import psycopg2
import boto3  # ✅ AWS S3용 라이브러리 추가
from botocore.exceptions import NoCredentialsError # ✅ 예외처리용

# ✅ [중요] Pydantic 모델은 반드시 앱 초기화 전에 있어야 안전합니다.
from pydantic import BaseModel 

# 만든 모듈 임포트
from analyzer import BrandAnalyzer
from db_search import DBSearchEngine
from scheduler import TrademarkScheduler
from dotenv import load_dotenv

# 인설트 임포트
from datetime import date
import traceback
from fastapi.middleware.cors import CORSMiddleware

# .env 로드
load_dotenv()

# ✅ AWS S3 설정 (환경변수에서 가져옴)
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_BUCKET_NAME = os.getenv("AWS_BUCKET_NAME", "royalty-team-bucket-2026") # 버킷명 확인 필요
AWS_REGION = os.getenv("AWS_REGION", "ap-northeast-2")

# S3 클라이언트 생성
s3_client = boto3.client(
    's3',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

# ✅ S3 업로드 헬퍼 함수
def upload_to_s3(file_bytes, original_filename, folder="patent_images"):
    try:
        ext = original_filename.split('.')[-1]
        unique_name = f"{uuid.uuid4()}.{ext}"
        s3_key = f"{folder}/{unique_name}"

        # S3 업로드
        s3_client.put_object(
            Bucket=AWS_BUCKET_NAME,
            Key=s3_key,
            Body=file_bytes,
            ContentType=f"image/{ext}"  # 브라우저에서 바로 보기 위해 필수
        )
        
        # URL 생성
        url = f"https://{AWS_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        return url
    except Exception as e:
        print(f"❌ S3 Upload Failed: {e}")
        raise e

# ✅ 테스트 데이터 입력용 데이터 구조 정의 (DTO)
class TestDataReq(BaseModel):
    trademark_name: str
    applicant: str
    status: str = "출원"
    application_number: str

app = FastAPI()

# cors 설정(프론트연결)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite/React 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("🔥🔥🔥 THIS IS MY MAIN.PY 🔥🔥🔥")
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
            # 검색 기능은 임시 파일 저장 방식을 유지해도 무방 (DB 저장이 아니므로)
            # 원한다면 여기도 io.BytesIO로 바꿀 수 있지만, 일단 유지
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
# 2. [NEW] 알림 테스트용 데이터 강제 삽입 API (S3 적용 버전)
# ========================================================
@app.post("/api/v1/test/insert/image")
async def insert_test_image(
    trademark_name: str = Form(...),
    applicant: str = Form(...),
    application_number: str = Form(...),
    category: str = Form(...),
    application_date: str = Form(...),  # 예: "2026-02-03"
    file: UploadFile = File(...)
):
    # 로컬 파일 저장 로직 제거됨

    try:
        print("✅ API 진입")
        print("trademark_name:", trademark_name)
        
        # 1️⃣ 파일 데이터 메모리로 읽기 (디스크 저장 X)
        file_content = await file.read()
        
        # 2️⃣ S3 업로드 실행 (여기서 URL 획득)
        s3_url = upload_to_s3(file_content, file.filename)
        print("✅ S3 업로드 완료:", s3_url)

        # 3️⃣ 벡터 생성
        # 메모리에 있는 이미지 데이터를 파일처럼 읽기 위해 io.BytesIO 사용
        image_vector = analyzer.get_image_vector(io.BytesIO(file_content))
        print("✅ image_vector 생성 완료", image_vector.shape)

        text_vector = analyzer.get_text_vector(trademark_name)
        print("✅ text_vector 생성 완료")

        # 4️⃣ DB INSERT (S3 URL 저장)
        conn = psycopg2.connect(**search_engine.db_config)
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO patent (
                application_number,
                trademark_name,
                applicant,
                category,
                application_date,
                status,
                text_vector,
                image_vector,
                image_url
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s::vector, %s::vector, %s)
            RETURNING patent_id
        """, (
            application_number,
            trademark_name,
            applicant,
            category,
            application_date,
            "출원",
            text_vector.tolist(),
            image_vector.tolist(),
            s3_url  # 👈 로컬 경로 대신 S3 URL 저장!
        ))

        patent_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return {
            "status": "success", 
            "patent_id": patent_id, 
            "image_url": s3_url
        }

    except Exception as e:
        print("❌ INSERT ERROR 발생")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    # finally 삭제 (로컬 파일을 안 만드니까 지울 필요 없음)

 
# 텍스트 쪽
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
    
@app.post("/api/v1/vectorize")
async def vectorize_data(
    text: str = Form(None),
    file: UploadFile = File(None)
):
    """
    [자바 전용] 텍스트나 이미지를 받아서 '벡터(숫자 배열)'만 리턴하는 API
    """
    response = {"status": "success", "text_vector": [], "image_vector": []}

    try:
        # 1. 텍스트 벡터 추출
        if text:
            text_vec = analyzer.get_text_vector(text)
            response["text_vector"] = text_vec.tolist() # 리스트로 변환

        # 2. 이미지 벡터 추출
        if file:
            # 파일 내용을 메모리에서 바로 읽음
            content = await file.read()
            if content:
                # 바이트 데이터를 이미지로 변환하여 벡터 추출
                image_vec = analyzer.get_image_vector(io.BytesIO(content))
                response["image_vector"] = image_vec.tolist()
        
        # (참고) URL 처리 로직은 자바가 '파일(byte)'로 변환해서 보내주므로 
        # 파이썬에서는 'file' 파라미터 하나로 다 처리가 됩니다!

        return response

    except Exception as e:
        print(f"❌ 벡터 추출 실패: {e}")
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)