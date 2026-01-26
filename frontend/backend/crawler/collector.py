import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import xml.etree.ElementTree as ET
import time
import random
import psycopg2
import datetime # 날짜 확인용

# ==========================================
# 1. 설정
# ==========================================
SERVICE_KEY = "여기에_본인_API키를_입력하세요"

DB_CONFIG = {
    "host": "localhost",
    "database": "royalty",
    "user": "postgres",
    "password": "password",
    "port": "5433"
}

START_YEAR = 2000 # 숫자 변경해야함
END_YEAR = 2025

# ==========================================
# 2. 유틸리티
# ==========================================
def get_zombie_session():
    session = requests.Session()
    retry = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("http://", adapter)
    session.mount("https://", adapter)
    return session

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/119.0.0.0 Safari/537.36"
]

def get_safe_text(item, tag):
    node = item.find(tag)
    if node is not None and node.text is not None:
        return node.text.strip()
    return ""

# ==========================================
# 3. 메인 실행
# ==========================================
def run_collector():
    print(f"🚀 [KIPRIS 좀비 수집기] {END_YEAR}년 ~ {START_YEAR}년 데이터 사냥 시작...")
    
    conn = None
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        print("✅ DB 연결 성공!")
    except Exception as e:
        print(f"❌ DB 연결 실패: {e}")
        return

    url = "http://plus.kipris.or.kr/kipo-api/kipi/trademarkInfoSearchService/getAdvancedSearch"

    for year in range(END_YEAR, START_YEAR - 1, -1):
        print(f"\n📂 [{year}년] 데이터 수집 시작...")
        
        # [★★핵심 수정★★] 세션을 여기서 매년 새로 만듭니다! (쿠키 초기화)
        session = get_zombie_session() 
        
        date_range = f"{year}0101~{year}1231"
        page_no = 1
        year_count = 0
        
        while True:
            params = {
                "ServiceKey": SERVICE_KEY,
                "applicationDate": date_range,
                "application": "true", "registration": "true", "figure": "true",
                "numOfRows": "500",
                "pageNo": str(page_no)
            }
            headers = {"User-Agent": random.choice(USER_AGENTS)}

            if page_no == 1:
                print(f"   🕵️ [검증] {year}년 세션으로 요청: {params['applicationDate']}")

            try:
                response = session.get(url, params=params, headers=headers, timeout=30)
                try:
                    root = ET.fromstring(response.text)
                except:
                    print("   ⚠️ XML 깨짐 -> 재시도")
                    time.sleep(1)
                    continue

                items = root.findall('.//item')
                if not items:
                    print(f"   ✅ {year}년 수집 끝! (총 {year_count}개 저장)")
                    break

                for item in items:
                    app_num = get_safe_text(item, 'applicationNumber')
                    title = get_safe_text(item, 'title')
                    applicant = get_safe_text(item, 'applicantName')
                    app_date_str = get_safe_text(item, 'applicationDate') 
                    category = get_safe_text(item, 'classificationCode')
                    
                    img_url = get_safe_text(item, 'bigDrawing')
                    if not img_url: img_url = get_safe_text(item, 'drawing')

                    fmt_date = None
                    if app_date_str:
                        clean_date = app_date_str.replace('.', '').replace('-', '')
                        if len(clean_date) == 8:
                            fmt_date = f"{clean_date[:4]}-{clean_date[4:6]}-{clean_date[6:]}"

                    if app_num and img_url:
                        sql = """
                            INSERT INTO patent 
                            (application_number, trademark_name, image_url, applicant, application_date, category) 
                            VALUES (%s, %s, %s, %s, %s, %s) 
                            ON CONFLICT (application_number) DO NOTHING
                        """
                        try:
                            cur.execute(sql, (app_num, title, img_url, applicant, fmt_date, category))
                            if cur.rowcount > 0: # 실제로 저장된 것만 카운트
                                year_count += 1
                        except Exception as e:
                            conn.rollback()
                
                conn.commit()
                if page_no % 10 == 0:
                    # 실제 저장된 개수만 보여주도록 수정
                    print(f"   Running... [{year}년] {page_no}페이지 (새로 저장된 데이터: {year_count}개)")

                page_no += 1
                time.sleep(random.uniform(0.5, 1.0))

            except Exception as e:
                print(f"   💥 에러: {e}")
                conn.rollback()
                time.sleep(10)

    cur.close()
    conn.close()
    print("\n🎉 [완료] 수집 끝!")

if __name__ == "__main__":
    run_collector()