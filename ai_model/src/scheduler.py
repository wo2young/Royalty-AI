from apscheduler.schedulers.background import BackgroundScheduler
import requests
import xmltodict
import psycopg2
import os
import datetime
from pathlib import Path
from dotenv import load_dotenv

# 환경 변수 로드
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent.parent
env_path = root_dir / '.env'

if env_path.exists():
    load_dotenv(dotenv_path=env_path)

class TrademarkScheduler:
    def __init__(self, analyzer):
        self.analyzer = analyzer
        self.scheduler = BackgroundScheduler()
        
        self.db_config = {
            "host": os.getenv("DB_HOST"),
            "database": os.getenv("DB_NAME"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "port": os.getenv("DB_PORT", "5432"),
            "sslmode": "require"
        }
        
        self.api_key = os.getenv("KIPRIS_API_KEY")

    def start(self):
        # 매일 새벽 4시에 실행
        self.scheduler.add_job(self.fetch_and_update_data, 'cron', hour=4, minute=0)
        self.scheduler.start()
        print("⏰ Scheduler started: Data update set for 04:00 AM daily.")

    def fetch_and_update_data(self):
        print(f"🔄 [Scheduler] Fetching KIPRIS data... ({datetime.datetime.now()})")
        
        if not self.api_key:
            print("⚠️ [Scheduler] API Key missing. Check .env file.")
            return

        # 1. KIPRIS API 호출 (예: 최근 출원된 상표 검색)
        url = "http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getWordSearch"
        
        # 날짜 범위 설정 (어제 하루 or 최근 일주일)
        today = datetime.date.today()
        yesterday = today - datetime.timedelta(days=1)
        date_str = f"{yesterday.strftime('%Y%m%d')}~{today.strftime('%Y%m%d')}"

        params = {
            "ServiceKey": self.api_key,
            "applicationDate": date_str,
            "numOfRows": "20",  # 한 번에 가져올 개수
            "word": ""          # 전체 검색
        }

        try:
            response = requests.get(url, params=params, timeout=10)
            if response.status_code != 200:
                print(f"❌ [API Error] Status Code: {response.status_code}")
                return

            # 2. XML 파싱
            data_dict = xmltodict.parse(response.text)
            
            # 검색 결과가 없는 경우 예외 처리
            try:
                items = data_dict['response']['body']['items']['item']
            except (KeyError, TypeError):
                print("✅ [Scheduler] No new trademark data found.")
                return

            # 리스트가 아니라 단일 객체일 경우 리스트로 변환
            if isinstance(items, dict):
                items = [items]

            print(f"📦 [Scheduler] Found {len(items)} new items from API.")

            # 3. DB 저장
            insert_count = 0
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor() as cur:
                    for item in items:
                        # 필수 필드 추출
                        app_num = item.get('applicationNumber')
                        name = item.get('title')
                        applicant = item.get('applicantName')
                        status = item.get('applicationStatus')
                        # 큰 이미지 우선, 없으면 썸네일
                        image_url = item.get('bigDrawing', item.get('drawing'))

                        if not name or not app_num:
                            continue

                        # 텍스트 벡터 생성
                        text_vec = self.analyzer.get_text_vector(name)
                        
                        # 중복 방지 (application_number 기준)
                        query = """
                            INSERT INTO patent (application_number, trademark_name, applicant, status, text_vector, image_url)
                            VALUES (%s, %s, %s, %s, %s::vector, %s)
                            ON CONFLICT (application_number) DO NOTHING
                        """
                        cur.execute(query, (
                            app_num, 
                            name, 
                            applicant, 
                            status, 
                            text_vec.tolist(),
                            image_url
                        ))
                        
                        # INSERT가 실제로 일어났는지 확인 (rowcount > 0)
                        if cur.rowcount > 0:
                            insert_count += 1
                
                # [중요] 커밋
                conn.commit()

            print(f"✅ [Scheduler] Successfully saved {insert_count} items to DB.")

        except Exception as e:
            print(f"❌ [Scheduler Error] {e}")