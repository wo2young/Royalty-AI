import requests
import xml.etree.ElementTree as ET
import time
import psycopg2
import os
import urllib.request
import re
from socket import timeout
from concurrent.futures import ThreadPoolExecutor, as_completed

class PatentCollector:
    def __init__(self, analyzer_instance=None):
        self.analyzer = analyzer_instance
        # 타겟 카테고리 (IT, 전자, 광고, 서비스 등)
        self.TARGET_CLASSES = ['09', '35', '42', '9'] 
        
        self.db_config = {
            "host": "host.docker.internal",
            "database": "postgres",
            "user": "postgres",
            "password": "password",
            "port": "5434"
        }
        
        self.API_KEY = "KptjGcopEpnVgG=FeP/3zFxTZ31PRVQq7sXudfMz1E8=" # 키 입력 완료
        self.BASE_URL = "http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getAdvancedSearch"

    def get_connection(self):
        return psycopg2.connect(**self.db_config)

    def clean_text(self, text):
        if not text: return ""
        return re.sub(r'<[^>]+>', '', text).strip()

    def download_and_vectorize(self, img_url, trademark_name):
        if not img_url or not self.analyzer:
            return [0.0] * 1280
        
        safe_name = re.sub(r'[\\/*?:"<>|]', "", trademark_name)[:10]
        temp_filename = f"temp_{os.getpid()}_{int(time.time()*1000)}_{safe_name}.jpg"
        
        try:
            # 타임아웃 5초
            urllib.request.urlretrieve(img_url, temp_filename)
            vec = self.analyzer.get_image_vector(temp_filename)
            return vec.tolist()
        except:
            return [0.0] * 1280
        finally:
            if os.path.exists(temp_filename):
                try: os.remove(temp_filename)
                except: pass

    def fetch_page_data(self, keyword, page, min_date=None):
        params = {
            'ServiceKey': self.API_KEY,
            'trademarkName': keyword,
            'docsStart': page,
            'docsCount': 50,
            'application': 'true', 'registration': 'true', 'refused': 'true',
            'expiration': 'false', 'withdrawal': 'false', 'publication': 'true',
            'cancel': 'false', 'abandonment': 'false',
            'trademark': 'true', 'serviceMark': 'true', 'trademarkServiceMark': 'true',
            'businessEmblem': 'true', 'collectiveMark': 'true', 'geoOrgMark': 'true',
            'certMark': 'true', 'geoCertMark': 'true', 'internationalMark': 'true',
            'character': 'true', 'figure': 'true', 'compositionCharacter': 'true',
            'figureComposition': 'true'
        }

        try:
            response = requests.get(self.BASE_URL, params=params, timeout=15)
            if response.status_code != 200: return 0

            root = ET.fromstring(response.text)
            items = root.findall('.//item')
            if not items: return 0

            batch_data = []
            
            for item in items:
                raw_title = item.findtext('title')
                tm_name = self.clean_text(raw_title)
                raw_category = item.findtext('classificationCode', '')
                reg_date = item.findtext('registrationDate', '')

                # [카테고리 필터링]
                is_target = False
                for target in self.TARGET_CLASSES:
                    if raw_category and target in raw_category:
                        is_target = True
                        break
                if not is_target: continue

                # [날짜 필터링]
                if min_date:
                    if not reg_date or reg_date < min_date:
                        continue

                app_number = item.findtext('applicationNumber')
                img_url = item.findtext('bigDrawing')
                applicant = item.findtext('applicantName')
                status = item.findtext('applicationStatus', '정보없음')
                app_date = item.findtext('applicationDate', '')

                text_vec = self.analyzer.get_text_vector(tm_name).tolist() if self.analyzer else [0.0]*768
                img_vec = self.download_and_vectorize(img_url, tm_name)

                batch_data.append((
                    app_number, tm_name, applicant, img_url, 
                    raw_category, status, app_date, reg_date,
                    img_vec, text_vec
                ))

            if batch_data:
                saved_count = self.save_batch(batch_data) # 저장된 개수 반환받음
                if saved_count > 0:
                    print(f"✅ Page {page}: {saved_count}건 DB 저장 성공")
                return saved_count
            
            return 0

        except Exception as e:
            return 0

    def collect_data(self, keyword, start_page=1, end_page=100, min_date=None):
        mode_msg = f"📅 2015년 이후 데이터만" if min_date else "♾️ 전체 기간"
        print(f"🚀 수집 시작: '{keyword}' ({mode_msg})")
        
        total_saved = 0
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(self.fetch_page_data, keyword, page, min_date) 
                for page in range(start_page, end_page + 1)
            ]
            
            for future in as_completed(futures):
                total_saved += future.result()

        print(f"🎉 '{keyword}' 완료. 총 {total_saved}건 저장.")

    def save_batch(self, data_list):
        conn = None
        try:
            conn = self.get_connection()
            with conn.cursor() as cur:
                sql = """
                    INSERT INTO patent (
                        application_number, trademark_name, applicant, image_url, 
                        category, legal_status, application_date, registration_date,
                        image_vector, text_vector
                    ) VALUES (
                        %s, %s, %s, %s, 
                        %s, %s, %s, %s,
                        %s, %s
                    ) ON CONFLICT (application_number) DO NOTHING
                """
                
                # [핵심 수정 부분] 벡터 리스트를 문자열로 변환!
                formatted_data = []
                for row in data_list:
                    r = list(row)
                    # 8번 인덱스(이미지벡터), 9번 인덱스(텍스트벡터)를 str()로 감싸줍니다.
                    # 예: [0.1, 0.2] -> "[0.1, 0.2]"
                    r[8] = str(r[8]) 
                    r[9] = str(r[9])
                    formatted_data.append(tuple(r))

                cur.executemany(sql, formatted_data)
            conn.commit()
            return len(data_list) # 성공하면 개수 리턴

        except Exception as e:
            # [핵심 수정 부분] 에러를 숨기지 않고 출력!
            print(f"❌ [DB 저장 실패] 이유: {e}")
            return 0 # 실패하면 0 리턴
        finally:
            if conn: conn.close()