import psycopg2
from analyzer import BrandAnalyzer
import numpy as np

# DB 설정
DB_CONFIG = {
    "host": "localhost", "database": "royalty",
    "user": "postgres", "password": "password", "port": "5433"
}

def start_indexing():
    analyzer = BrandAnalyzer()
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    # 1. 아직 벡터화되지 않은 데이터 가져오기
    # (주의: DB에 image_vector, text_vector 컬럼이 미리 추가되어 있어야 합니다)
    cur.execute("SELECT application_number, image_url, trademark_name FROM patent WHERE image_vector IS NULL LIMIT 100")
    rows = cur.fetchall()

    for row in rows:
        app_num, img_url, title = row
        try:
            # 2. 벡터 추출
            # (실제 환경에선 img_url을 다운로드하는 로직이 추가되어야 합니다)
            img_vec = analyzer.get_image_vector_from_url(img_url) 
            txt_vec = analyzer.get_text_vector(title)

            # 3. DB 업데이트
            cur.execute("""
                UPDATE patent 
                SET image_vector = %s, text_vector = %s 
                WHERE application_number = %s
            """, (img_vec.tolist(), txt_vec.tolist(), app_num))
            
            conn.commit()
            print(f"✅ {app_num} 인덱싱 완료")
        except Exception as e:
            print(f"❌ {app_num} 실패: {e}")
            conn.rollback()

    cur.close()
    conn.close()