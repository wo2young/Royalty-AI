import psycopg2
import requests
import torch
import time
from io import BytesIO
from PIL import Image
from analyzer import BrandAnalyzer

DB_CONFIG = {
    "host": "localhost", "database": "royalty",
    "user": "postgres", "password": "password", "port": "5433"
}

def run_image_indexing(batch_size=50): # 10개는 너무 감질나니 50개로 상향!
    analyzer = BrandAnalyzer()
    
    while True:
        conn = None
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            print(f"🔄 DB 연결 성공. 이미지 벡터화 작업을 시작합니다. (Batch: {batch_size})")

            while True:
                # 1. 대상 가져오기 (성능을 위해 정렬 제거하거나 인덱스 활용)
                cur.execute("""
                    SELECT application_number, image_url 
                    FROM patent 
                    WHERE image_vector IS NULL AND image_url IS NOT NULL 
                    LIMIT %s
                """, (batch_size,))
                
                rows = cur.fetchall()
                if not rows:
                    print("✨ 모든 이미지 벡터화가 완료되었습니다!")
                    return

                update_data = []
                for app_num, img_url in rows:
                    try:
                        # 2. 이미지 다운로드 (타임아웃 강화)
                        response = requests.get(img_url, timeout=7)
                        response.raise_for_status() # 404, 500 에러 시 예외 발생
                        
                        img = Image.open(BytesIO(response.content)).convert('RGB')
                        
                        # 3. 모델 추론
                        img_tensor = analyzer.img_transform(img).unsqueeze(0)
                        with torch.no_grad():
                            img_vec = analyzer.img_model(img_tensor).flatten().numpy().tolist()
                        
                        update_data.append((img_vec, app_num))
                        
                    except Exception as e:
                        # 개별 이미지 실패 시 기록만 하고 다음으로 넘어감
                        print(f"⚠️ {app_num} 건너뜀 (사유: {e})")
                        # (선택사항) 계속 실패하는 URL은 아예 체크용 값을 넣어서 다시 시도 안 하게 할 수도 있습니다.

                # 4. 벌크 업데이트 (executemany로 속도 향상)
                if update_data:
                    cur.executemany("UPDATE patent SET image_vector = %s WHERE application_number = %s", update_data)
                    conn.commit()
                    print(f"✅ {len(update_data)}건 업데이트 완료 (Batch 세트 종료)")

        except (psycopg2.OperationalError, psycopg2.InterfaceError) as db_err:
            print(f"🚨 DB 연결 끊김 발생: {db_err}. 10초 후 재연결 시도...")
            time.sleep(10)
        finally:
            if conn:
                conn.close()

if __name__ == "__main__":
    run_image_indexing()