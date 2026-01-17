import psycopg2
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta

class DailyAutomation:
    def __init__(self, analyzer_instance=None):
        self.analyzer = analyzer_instance
        # ⚠️ 도커 안에서 로컬 DB 접속을 위해 host 수정
        self.db_config = {
            "host": "host.docker.internal", # 127.0.0.1 대신 이거 사용!
            "database": "royalty",
            "user": "postgres", "password": "password", "port": "5433"
        }
        self.api_key = "JPaSHBTWAi2DYAX31dCpJiQqtwQSYwOP8uxYTdTbUdw="
        self.api_url = "http://plus.kipris.or.kr/kpatlas/openapi/rest/TrademarkFreeSearchService/freeSearch"

    def collect_new_data(self, days=1):
        """특허청 API에서 데이터를 가져와 DB에 INSERT"""
        end_date = datetime.now().strftime('%Y%m%d')
        start_date = (datetime.now() - timedelta(days=days)).strftime('%Y%m%d')
        
        params = {
            'ServiceKey': self.api_key,
            'applicationDate': f"{start_date}~{end_date}",
            'numOfRows': 10
        }

        try:
            print(f"📡 API 호출 주소: {self.api_url}")
            resp = requests.get(self.api_url, params=params, timeout=10)
            
            if resp.status_code != 200:
                print(f"❌ API 호출 실패 (상태코드: {resp.status_code})")
                return 0

            # XML 파싱 (KIPRIS는 기본적으로 XML을 줍니다)
            root = ET.fromstring(resp.content)
            items = root.findall('.//item') # API 응답 구조에 따라 수정 필요할 수 있음
            
            inserted_count = 0
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor() as cur:
                    for item in items:
                        # 예시: XML 태그명은 실제 KIPRIS 명세서 확인 필요
                        app_num = item.findtext('applicationNumber')
                        name = item.findtext('trademarkName')
                        img_url = item.findtext('bigDrawing')

                        if app_num and name:
                            cur.execute("""
                                INSERT INTO patent (application_number, trademark_name, image_url)
                                VALUES (%s, %s, %s)
                                ON CONFLICT (application_number) DO NOTHING
                            """, (app_num, name, img_url))
                            inserted_count += cur.rowcount
            
            print(f"✅ DB 적재 완료: {inserted_count}건")
            return inserted_count

        except Exception as e:
            # ❗ 여기서 에러를 정확히 출력해야 도커 로그에 보입니다.
            print(f"🔥 [수집단계 에러발생]: {str(e)}")
            raise e

    def run_pipeline(self, days=1):
        """전체 프로세스 실행"""
        print(f"📅 {datetime.now()} 파이프라인 가동")
        new_count = self.collect_new_data(days)
        
        # 새로 들어온 게 있거나, 기존에 벡터가 없는 데이터가 있다면 처리
        self.process_pending_vectors()
        return f"성공: {new_count}건 처리됨"

    def process_pending_vectors(self):
        """DB를 뒤져서 벡터(NULL)를 채워넣는 로직 (기존 코드 유지)"""
        # ... (생략) ...
        pass