import psycopg2
from analyzer import BrandAnalyzer
import time

# DB 설정 (팀장님 환경에 맞게)
DB_CONFIG = {
    "host": "127.0.0.1", "database": "royalty",
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
            
            # 루나레이크 32GB 램에서는 5000개도 거뜬합니다.
            # 배치 사이즈를 키우면 DB 왕복 횟수가 줄어들어 전체 속도가 빨라집니다.
            batch_size = 5000 
            
            while True:
                # [성능 팁] ORDER BY는 데이터가 많아질수록 느려집니다. 
                # 현재는 index가 있을 테니 유지하되, 나중에 느려지면 제거해도 좋습니다.
                cur.execute("""
                    SELECT application_number, trademark_name 
                    FROM patent 
                    WHERE text_vector IS NULL 
                    LIMIT %s
                """, (batch_size,))
                
                rows = cur.fetchall()
                if not rows:
                    print("✨ 모든 데이터 벡터화 완료. 1분 후 신규 데이터 확인...")
                    time.sleep(60)
                    continue
                    
                app_nums = [r[0] for r in rows]
                names = [r[1] if r[1] else "" for r in rows] # null 방어 로직 추가
                
                # 배치 처리는 그대로 유지 (루나레이크 CPU가 가장 잘하는 일입니다)
                vectors = analyzer.get_text_vectors_batch(names)
                
                update_data = [(v.tolist(), n) for v, n in zip(vectors, app_nums)]
                
                # executemany로 벌크 업데이트
                cur.executemany("UPDATE patent SET text_vector = %s WHERE application_number = %s", update_data)
                conn.commit()
                print(f"✅ {len(app_nums)}개 텍스트 처리 완료 ({time.strftime('%H:%M:%S')})")
                
        except (psycopg2.OperationalError, psycopg2.InterfaceError) as e:
            print(f"🔄 DB 연결 일시 중단: {e}. 10초 대기...")
            time.sleep(10)
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    run_mass_text_indexing()