from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from analyzer import BrandAnalyzer
from daily_pipeline import DailyAutomation
from apscheduler.schedulers.background import BackgroundScheduler # 추가
import uvicorn
import shutil
import os

app = FastAPI(title="Royalty AI Model Server")

# 1. 심장(모델)을 하나만 만듭니다.
analyzer = BrandAnalyzer()

# 2. 일꾼(automation)에게 이미 만든 심장을 나눠줍니다. (메모리 절약 핵심!)
automation = DailyAutomation(analyzer_instance=analyzer)

class TextQuery(BaseModel):
    query: str

# 2. 스케줄러 설정 (서버 시작 시 자동 실행)
scheduler = BackgroundScheduler()

# 매일 오후 2시(14시)에 '최근 3일치' 데이터 자동 수집 실행
# 중복 데이터는 DB 레벨(ON CONFLICT DO NOTHING)에서 자동으로 걸러집니다.
scheduler.add_job(
    func=automation.run_pipeline, 
    trigger='cron', 
    hour=14,      # 오후 2시
    minute=0,     # 0분
    args=[3],     # ✅ 1일 대신 3일치(days=3) 인자 전달
    id='daily_update_job',
    replace_existing=True
)

@app.on_event("startup")
def start_scheduler():
    scheduler.start()
    print("⏰ 백그라운드 스케줄러 시작: 매일 새벽 3시 자동 업데이트")

@app.on_event("shutdown")
def stop_scheduler():
    scheduler.shutdown()
    print("⏰ 스케줄러 종료")

@app.get("/")
def health_check():
    return {"status": "online", "message": "Royalty AI Model Server is running with Scheduler"}

@app.post("/api/v1/embed/text")
async def embed_text(data: TextQuery):
    try:
        vector = analyzer.get_text_vector(data.query)
        return {"vector": vector.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/embed/image")
async def embed_image(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        img_vec = analyzer.get_image_vector(temp_path)
        return {"vector": img_vec.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/v1/update/now")
async def trigger_update():
    try:
        # 수동 버튼 클릭 시에도 최근 3일치를 훑도록 수정
        result_message = automation.run_pipeline(days=3)
        return {"status": "success", "message": result_message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"업데이트 실패: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)