import psycopg2
import requests
import torch
import time
from io import BytesIO
from PIL import Image
from analyzer import BrandAnalyzer
from concurrent.futures import ThreadPoolExecutor

DB_CONFIG = {
    "host": "127.0.0.1", 
    "database": "royalty",
    "user": "postgres", 
    "password": "password", 
    "port": "5433",
    "connect_timeout": 10
}

MAX_WORKERS = 15 
BATCH_SIZE = 300 

def fetch_and_preprocess(row):
    app_num, img_url = row
    if not img_url or not img_url.startswith('http'):
        return (app_num, None)
    try:
        response = requests.get(img_url, timeout=2)
        response.raise_for_status()
        img = Image.open(BytesIO(response.content)).convert('RGB')
        return (app_num, img)
    except Exception:
        return (app_num, None)

def run_turbo_image_indexing():
    print("📍 [진단 2] BrandAnalyzer 초기화...")
    try:
        analyzer = BrandAnalyzer()
        print("📍 [진단 3] 모델 로드 완료!")
    except Exception as e:
        print(f"❌ 모델 로드 에러: {e}")
        return

    device = torch.device("cpu")
    analyzer.img_model.to(device)
    analyzer.img_model.eval()
    
    # 팀장님 모델에 맞춘 차원 설정
    VECTOR_DIM = 1000 
    print(f"🚀 이미지 인덱싱 시작 (배치: {BATCH_SIZE}, 차원: {VECTOR_DIM})")

    while True:
        conn = None
        try:
            conn = psycopg2.connect(**DB_CONFIG)
            cur = conn.cursor()
            print("📍 [진단 7] DB 연결 성공!")

            while True:
                cur.execute("""
                    SELECT application_number, image_url 
                    FROM patent 
                    WHERE image_vector IS NULL 
                      AND image_url IS NOT NULL 
                    LIMIT %s
                """, (BATCH_SIZE,))
                
                rows = cur.fetchall()
                if not rows:
                    print("✨ 모든 이미지 처리 완료!")
                    return

                with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
                    results = list(executor.map(fetch_and_preprocess, rows))
                
                update_data = []
                failed_count = 0

                for app_num, img in results:
                    if img is None:
                        # [차원 수정] 에러 발생했던 512를 1000으로 교체
                        dummy_vec = [0.0] * VECTOR_DIM
                        update_data.append((dummy_vec, app_num))
                        failed_count += 1
                        continue
                    
                    try:
                        img_tensor = analyzer.img_transform(img).unsqueeze(0).to(device)
                        with torch.no_grad():
                            img_vec = analyzer.img_model(img_tensor).flatten().cpu().numpy().tolist()
                        
                        # 혹시 모델 출력 차원이 다를 경우를 대비한 방어 로직
                        if len(img_vec) != VECTOR_DIM:
                            update_data.append(([0.0] * VECTOR_DIM, app_num))
                            failed_count += 1
                        else:
                            update_data.append((img_vec, app_num))
                    except Exception:
                        update_data.append(([0.0] * VECTOR_DIM, app_num))
                        failed_count += 1

                if update_data:
                    cur.executemany("""
                        UPDATE patent 
                        SET image_vector = %s 
                        WHERE application_number = %s
                    """, update_data)
                    conn.commit()
                    
                    success_count = len(update_data) - failed_count
                    print(f"✅ {len(update_data)}건 처리 (성공: {success_count}, 실패: {failed_count}) | {time.strftime('%H:%M:%S')}")

        except Exception as e:
            print(f"🚨 에러 발생: {e}. 10초 대기...")
            time.sleep(10)
        finally:
            if conn: conn.close()

if __name__ == "__main__":
    run_turbo_image_indexing()