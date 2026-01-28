from apscheduler.schedulers.background import BackgroundScheduler
import requests
import psycopg2
from psycopg2.extras import execute_values
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------------
# [환경 변수 로드]
# 현재 파일(scheduler.py) 위치: .../ai_model/src/
# .env 파일 위치: .../Royalty_Team/
# 따라서 2단계 상위 폴더로 이동해야 함
# ---------------------------------------------------------
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent.parent  # src -> ai_model -> Royalty_Team
env_path = root_dir / '.env'

# .env 파일이 있으면 로드, 없으면 시스템 환경변수 사용
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"✅ Loaded .env from: {env_path}")
else:
    print("⚠️ .env file not found. Using system environment variables.")

class TrademarkScheduler:
    def __init__(self, analyzer):
        self.analyzer = analyzer
        self.scheduler = BackgroundScheduler()
        
        # .env에서 DB 정보 로드 (기본값 제거하여 보안 강화)
        self.db_config = {
            "host": os.getenv("DB_HOST"),
            "database": os.getenv("DB_NAME"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "port": os.getenv("DB_PORT", "5432"),
            "sslmode": "require"
        }
        
        # .env에서 API 키 로드
        self.api_key = os.getenv("KIPRIS_API_KEY")

    def start(self):
        # 매일 새벽 4시에 실행 (cron 방식)
        self.scheduler.add_job(self.fetch_and_update_data, 'cron', hour=4, minute=0)
        
        self.scheduler.start()
        print("⏰ Scheduler started: Data update set for 04:00 AM daily.")

    def fetch_and_update_data(self):
        print("🔄 [Scheduler] Fetching new trademark data...")
        try:
            # 예시 로직 (API 키 사용)
            if not self.api_key:
                print("⚠️ [Scheduler] KIPRIS_API_KEY is missing. Skipping update.")
                return

            new_items = [] 
            # new_items = parser_logic(data) 

            if not new_items:
                print("✅ [Scheduler] No new data found.")
                return

            # DB 연결
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor() as cur:
                    for item in new_items:
                        text_vec = self.analyzer.get_text_vector(item['name'])
                        
                        query = """
                            INSERT INTO patent (application_number, trademark_name, applicant, status, text_vector, image_url)
                            VALUES (%s, %s, %s, %s, %s::vector, %s)
                            ON CONFLICT (application_number) DO NOTHING
                        """
                        cur.execute(query, (
                            item['app_num'], 
                            item['name'], 
                            item['applicant'], 
                            item['status'], 
                            text_vec.tolist(),
                            item['image_url']
                        ))
                        
            print(f"✅ [Scheduler] Updated {len(new_items)} new trademarks.")

        except Exception as e:
            print(f"❌ [Scheduler Error] {e}")