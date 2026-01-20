import requests
import psycopg2
import xml.etree.ElementTree as ET
import io
from datetime import date, timedelta
from analyzer import BrandAnalyzer

class PatentCollector:
    # [수정] analyzer_instance를 인자로 받도록 변경
    def __init__(self, analyzer_instance=None):
        print("[Collector] 초기화 중...")
        
        # 외부에서 넣어주면 그걸 쓰고, 안 넣어주면 새로 만듦 (호환성 유지)
        if analyzer_instance:
            self.analyzer = analyzer_instance
        else:
            print("[Warning] Analyzer가 전달되지 않아 새로 생성합니다 (메모리 증가).")
            self.analyzer = BrandAnalyzer()
            
        self.db_config = {
            "host": "localhost",
            "database": "royalty",
            "user": "postgres", 
            "password": "password", 
            "port": "5433"
        }

    # [1] 특정 날짜의 데이터를 가져오는 함수
    def fetch_patents_by_date(self, target_date_str):
        print(f"[KIPRIS] {target_date_str} 일자 특허 데이터 조회 중...")
        
        API_URL = "http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getWordSearch"
        SERVICE_KEY = "ZRHVxLft478aps=xexV2IiIx/MXO/wOxpW6=YS/v9X4=" # 사용자 인증키
        
        params = {
            "ServiceKey": SERVICE_KEY,
            "applicationDate": target_date_str,
            "numOfRows": "50" 
        }
        
        try:
            response = requests.get(API_URL, params=params, timeout=10)
            
            if response.status_code != 200:
                print(f"API 호출 실패 ({target_date_str}): {response.status_code}")
                return []

            try:
                root = ET.fromstring(response.text)
                items = root.findall('.//item')
                
                if not items:
                    print(f"{target_date_str}: 검색된 데이터 없음")
                    return []

                result_list = []
                for item in items:
                    app_number = item.findtext('applicationNumber')
                    name = item.findtext('trademarkName')
                    
                    image_url = item.findtext('BigDrawing')
                    if not image_url: image_url = item.findtext('BigDrawingUrl')
                    if not image_url: image_url = item.findtext('imageUrl')

                    applicant = item.findtext('applicantName')
                    category = item.findtext('classificationCode')

                    mapped_item = {
                        "app_number": app_number if app_number else '',
                        "name": name if name else '',
                        "image_url": image_url if image_url else '',
                        "applicant": applicant if applicant else '',
                        "category": category if category else ''
                    }
                    
                    if mapped_item['name'] and mapped_item['image_url']:
                        result_list.append(mapped_item)
                
                print(f"{target_date_str}: {len(result_list)}건 발견")
                return result_list

            except ET.ParseError:
                print(f"XML 파싱 에러 ({target_date_str})")
                return []

        except Exception as e:
            print(f"API 연동 에러: {e}")
            return []

    # [2] 메인 로직: 최근 3일치 반복 수집
    def run_daily_collection(self):
        print("[Daily Job] 최근 3일치 특허 데이터 업데이트 시작")
        
        try:
            # 1. 최근 3일 날짜 리스트 생성
            target_dates = []
            today = date.today()
            for i in range(3): # 0(오늘), 1(어제), 2(그제)
                past_date = today - timedelta(days=i)
                target_dates.append(past_date.strftime("%Y%m%d"))
            
            print(f"수집 대상 날짜: {target_dates}")

            # 2. DB 연결
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor() as cur:
                    
                    for date_str in target_dates:
                        new_patents = self.fetch_patents_by_date(date_str)
                        
                        if not new_patents:
                            continue

                        print(f"[{date_str}] 데이터 {len(new_patents)}건 DB 저장 및 임베딩 시작...")

                        for item in new_patents:
                            try:
                                # (1) 텍스트 벡터
                                text_vec = self.analyzer.get_text_vector(item['name'])
                                
                                # (2) 이미지 벡터
                                img_response = requests.get(item['image_url'], stream=True, timeout=5)
                                if img_response.status_code == 200:
                                    image_bytes = io.BytesIO(img_response.content)
                                    img_vec = self.analyzer.get_image_vector(image_bytes)
                                else:
                                    print(f"이미지 다운로드 실패: {item['name']}")
                                    continue 

                                # (3) DB 저장 (중복 방지)
                                cur.execute("""
                                    INSERT INTO patent (
                                        application_number, trademark_name, image_url, applicant, 
                                        category, application_date, status, 
                                        image_vector, text_vector, created_at
                                    ) VALUES (
                                        %s, %s, %s, %s, 
                                        %s, TO_DATE(%s, 'YYYYMMDD'), '출원', 
                                        %s::vector, %s::vector, NOW()
                                    )
                                    ON CONFLICT (application_number) DO NOTHING; 
                                """, (
                                    item['app_number'], item['name'], item['image_url'], item['applicant'],
                                    item['category'], date_str,
                                    img_vec.tolist(), text_vec.tolist()
                                ))
                                
                            except Exception as inner_e:
                                print(f"개별 저장 실패 ({item.get('name')}): {inner_e}")

                        conn.commit()
                        print(f"[{date_str}] 저장 완료")

            print("[완료] 최근 3일치 데이터 업데이트 종료")

        except Exception as e:
            print(f"[Collector Error]: {str(e)}")


    # 3. [시연용] 가짜 데이터 강제 주입 (Demo Mode)
    def run_demo_collection(self, custom_data=None):
        print("[Demo] 시연용 데이터 생성을 시작합니다.")
        
        try:
            import random
            
            # 입력값이 있으면 그것을 쓰고, 없으면 랜덤값 생성
            if custom_data:
                # 사용자가 입력한 값 사용
                name = custom_data.get('name')
                applicant = custom_data.get('applicant')
                image_url = custom_data.get('image_url')
                category = custom_data.get('category')
                
                # 출원번호가 없으면 랜덤 생성
                app_num = custom_data.get('app_number')
                if not app_num:
                    app_num = f"99-2026-{random.randint(10000, 99999)}"
            else:
                # 입력값 없음 -> 100% 랜덤 생성 (기존 로직)
                rand_num = random.randint(1000, 9999)
                name = f"시연용 카피 브랜드 {rand_num}"
                applicant = "따라쟁이 주식회사"
                image_url = "https://dummyimage.com/600x400/000/fff&text=Copy+Cat"
                category = "09"
                app_num = f"99-2026-{rand_num}"

            fake_item = {
                "app_number": app_num,
                "name": name, 
                "image_url": image_url, 
                "applicant": applicant,
                "category": category
            }
            
            print(f"데이터 생성 중: {fake_item['name']} ({fake_item['app_number']})")

            # 2. DB 연결 및 저장
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor() as cur:
                    
                    # (1) 텍스트 벡터
                    text_vec = self.analyzer.get_text_vector(fake_item['name'])
                    
                    # (2) 이미지 벡터 (URL 다운로드)
                    try:
                        img_response = requests.get(fake_item['image_url'], stream=True, timeout=5)
                        if img_response.status_code == 200:
                            image_bytes = io.BytesIO(img_response.content)
                            img_vec = self.analyzer.get_image_vector(image_bytes)
                        else:
                            # 이미지가 깨졌거나 없을 경우 기본값(0벡터) 처리하거나 에러 발생
                            print("이미지 다운로드 실패, 빈 벡터로 대체합니다.")
                            import numpy as np
                            img_vec = np.zeros(1000) # ResNet50 출력 크기에 맞춤
                    except Exception as img_e:
                        print(f"이미지 처리 중 에러: {img_e}")
                        import numpy as np
                        img_vec = np.zeros(1000)

                    # (3) DB 저장
                    cur.execute("""
                        INSERT INTO patent (
                            application_number, trademark_name, image_url, applicant, 
                            category, application_date, status, 
                            image_vector, text_vector, created_at
                        ) VALUES (
                            %s, %s, %s, %s, 
                            %s, CURRENT_DATE, '출원', 
                            %s::vector, %s::vector, NOW()
                        )
                    """, (
                        fake_item['app_number'], fake_item['name'], fake_item['image_url'], 
                        fake_item['applicant'], fake_item['category'], 
                        img_vec.tolist(), text_vec.tolist()
                    ))
                    
                    conn.commit()
            
            print(f"[Demo] 데이터 DB 저장 완료! (AppNum: {fake_item['app_number']})")
            return {"status": "success", "message": "데이터 입력 성공", "data": fake_item}

        except Exception as e:
            print(f"[Demo Error]: {str(e)}")
            return {"status": "error", "message": str(e)}