import psycopg2
from analyzer import BrandAnalyzer
import time

# DB 설정 (팀장님 환경에 맞게)
DB_CONFIG = {
    "host": "localhost", "database": "royalty",
    "user": "postgres", "password": "password", "port": "5433"
}

# ... (기존 DB_CONFIG 설정) ...

def run_mass_text_indexing():
    analyzer = BrandAnalyzer()
    
    while True:
        conn = None
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            
            # 수집기와 충돌을 피하기 위해 배치 사이즈를 줄임
            batch_size = 2000
            
            while True:
                cur.execute("""
                    SELECT application_number, trademark_name 
                    FROM patent 
                    WHERE text_vector IS NULL 
                    ORDER BY application_date ASC  -- 오래된 데이터부터 차근차근
                    LIMIT %s
                """, (batch_size,))
                
                rows = cur.fetchall()
                if not rows:
                    print("✨ 모든 데이터 벡터화 완료. 1분 후 신규 데이터 확인...")
                    time.sleep(60) # 수집기가 새 데이터를 넣을 시간을 줌
                    continue
                    
                app_nums = [r[0] for r in rows]
                names = [r[1] for r in rows]
                vectors = analyzer.get_text_vectors_batch(names)
                
                update_data = [(v.tolist(), n) for v, n in zip(vectors, app_nums)]
                cur.executemany("UPDATE patent SET text_vector = %s WHERE application_number = %s", update_data)
                conn.commit()
                print(f"✅ {len(app_nums)}개 처리 완료 (수집기 동시 운용 중)")
                
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            print(f"🔄 DB 부하로 연결 일시 중단: {e}. 10초 대기 후 부활합니다.")
            time.sleep(10) # DB가 쉴 시간을 좀 더 줌
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    run_mass_text_indexing()