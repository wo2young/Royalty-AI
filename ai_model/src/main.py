from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import Optional
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler # [필수] 이거 없으면 에러남!
import uvicorn
import shutil
import os
import uuid # [필수] 파일명 중복 방지용

# 사용자 정의 모듈 임포트
from analyzer import BrandAnalyzer
from patent_collector import PatentCollector
from daily_pipeline import DailyAutomation

# ---------------------------------------------------------
# 전역 변수 설정 (None으로 초기화)
# ---------------------------------------------------------
collector = None
analyzer = None
automation = None

# ---------------------------------------------------------
# 1. Lifespan: 서버 켜지고 꺼질 때 실행되는 로직
# ---------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # [시작될 때 실행]
    print("🚀 [System] FastAPI 서버 시작! AI 모델 로딩 및 스케줄러 가동...")
    
    global collector, analyzer, automation
    
    # 1. AI 모델 및 자동화 도구 로딩
    # (주의: PatentCollector 내부에서도 BrandAnalyzer를 또 띄우면 메모리 2배 듭니다. 
    #  나중에 최적화하려면 PatentCollector에게 analyzer를 넘겨주도록 수정하면 좋습니다.)
    analyzer = BrandAnalyzer() 
    automation = DailyAutomation(analyzer_instance=analyzer)
    collector = PatentCollector(analyzer_instance=analyzer)
    
    # 2. 스케줄러 생성 및 등록
    scheduler = BackgroundScheduler()
    
    # 매일 14시 00분에 수집기 실행
    scheduler.add_job(collector.run_daily_collection, 'cron', hour=14, minute=0)
    
    # 스케줄러 시작
    scheduler.start()
    print("[System] 오후 2시 자동 업데이트 스케줄러가 설정되었습니다.")
    
    yield # 여기서 API가 동작함
    
    # [꺼질 때 실행]
    print("[System] 서버 종료. 스케줄러를 멈춥니다.")
    scheduler.shutdown()

# ---------------------------------------------------------
# 2. FastAPI 앱 설정
# ---------------------------------------------------------
app = FastAPI(lifespan=lifespan)

# DB 설정 (필요 시 참조용)
DB_CONFIG = {
    "host": "localhost", 
    "database": "royalty",
    "user": "postgres", 
    "password": "password", 
    "port": "5433"
}

# 1. 입력받을 데이터 모델 정의 (맨 아래 API 정의 부분 근처에 두세요)
class DemoDataRequest(BaseModel):
    name: str                  # 필수: 상표명
    applicant: str = "테스트 출원인"  # 기본값
    image_url: str = "https://dummyimage.com/600x400/000/fff&text=Test+Image" # 기본값
    category: str = "09"       # 기본값
    app_number: Optional[str] = None # 없으면 자동 생성

# ---------------------------------------------------------
# 3. API 엔드포인트
# ---------------------------------------------------------

# [시연용 API] 버튼 누르면 강제 업데이트
@app.post("/demo/trigger-update")
def trigger_demo_update(request: Optional[DemoDataRequest] = None):
    print("[API] 시연용 데이터 업데이트 요청 받음")
    
    if not collector:
        return {"status": "error", "message": "수집기가 아직 초기화되지 않았습니다."}

    # 요청 데이터가 있으면 딕셔너리로 변환, 없으면 None 전달 (랜덤 생성)
    custom_data = request.model_dump() if request else None
    
    # 수집기 실행
    result = collector.run_demo_collection(custom_data)
    return result


# [메인 검색 API] 하이브리드 검색
@app.post("/api/v1/search/hybrid")
async def search_hybrid(
    query_text: Optional[str] = Form(None), 
    file: Optional[UploadFile] = File(None)
):
    # 1. 입력값 검증
    if not query_text and not file:
        raise HTTPException(status_code=400, detail="텍스트나 이미지 중 하나는 필수입니다.")

    # 2. 임시 파일 경로 생성 (충돌 방지 UUID 사용)
    unique_filename = f"{uuid.uuid4()}_{file.filename}" if file else "temp.jpg"
    temp_path = f"temp_{unique_filename}"
    
    try:
        # --- 텍스트 벡터화 ---
        text_vec = None
        if query_text:
            text_vec = analyzer.get_text_vector(query_text)
        
        # --- 이미지 벡터화 ---
        img_vec = None
        if file:
            # 업로드된 파일을 로컬에 임시 저장
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # 저장된 파일로 벡터 추출
            img_vec = analyzer.get_image_vector(temp_path)

        # 3. DB에서 후보군 50개(텍스트+이미지+키워드) 추출
        candidates = automation.get_candidates_from_db(text_vec, img_vec, query_text=query_text)

        if not candidates:
            return {"status": "success", "results": [], "message": "No candidates found"}

        # 4. 하이브리드 재정렬 수행 (상위 30개 리턴)
        final_results = analyzer.calculate_hybrid_score(query_text, candidates, img_vec)

        return {"status": "success", "results": final_results}

    except Exception as e:
        print(f"검색 에러: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # [매우 중요] 사용한 임시 이미지 파일 삭제
        # 이 코드가 없으면 서버 용량이 가득 찰 때까지 쓰레기 파일이 쌓입니다.
        if file and os.path.exists(temp_path):
            os.remove(temp_path)
            # print(f"🧹 임시 파일 삭제 완료: {temp_path}")

# ---------------------------------------------------------
# 4. 서버 실행
# ---------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)