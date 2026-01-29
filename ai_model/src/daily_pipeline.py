import psycopg2
from datetime import datetime, timedelta
from analyzer import BrandAnalyzer
# 기존에 만드신 수집 모듈이 있다면 import 하세요
# from collector import KiprisCollector 

class DailyAutomation:
    def __init__(self):
        self.analyzer = BrandAnalyzer()
        self.db_config = {
            "host": "localhost", "database": "royalty",
            "user": "postgres", "password": "password", "port": "5433"
        }

    def run_pipeline(self):
        print(f"📅 {datetime.now().strftime('%Y-%m-%d')} 자동화 파이프라인 가동")
        
        # 1. 신규 데이터 수집 (어제 날짜 기준)
        new_count = self.collect_yesterday_data()
        
        if new_count > 0:
            # 2. 텍스트 벡터화
            self.embed_text()
            # 3. 이미지 벡터화
            self.embed_images()
            print(f"✅ 총 {new_count}건의 신규 데이터 처리 완료!")
        else:
            print("일치하는 신규 데이터가 없습니다.")

    def collect_yesterday_data(self):
        """KIPRIS API를 호출하여 어제 등록된 상표를 DB에 INSERT (ON CONFLICT 적용)"""
        yesterday = (datetime.now() - timedelta(1)).strftime('%Y%m%d')
        print(f"🔍 {yesterday}자 신규 수집 중...")
        # 여기에 기존 수집 로직을 넣으세요. 
        # 핵심 SQL: INSERT INTO patent (...) VALUES (...) ON CONFLICT (application_number) DO NOTHING;
        return 100 # 예시 건수

    def embed_text(self):
        """벡터가 없는(NULL) 데이터만 골라서 텍스트 임베딩"""
        with psycopg2.connect(**self.db_config) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT application_number, trademark_name FROM patent WHERE text_vector IS NULL")
                rows = cur.fetchall()
                for app_num, name in rows:
                    vec = self.analyzer.txt_model.encode(name).tolist()
                    cur.execute("UPDATE patent SET text_vector = %s WHERE application_number = %s", (vec, app_num))
            conn.commit()
        print(f"📝 텍스트 벡터화 완료 ({len(rows)}건)")

    def embed_images(self):
        """벡터가 없는(NULL) 데이터만 골라서 이미지 임베딩"""
        # 앞서 만든 image_indexer.py의 로직을 여기에 통합
        print("🖼️ 이미지 벡터화 완료")

if __name__ == "__main__":
    pipeline = DailyAutomation()
    pipeline.run_pipeline()