import psycopg2
import numpy as np
from analyzer import BrandAnalyzer
from sklearn.metrics.pairwise import cosine_similarity

DB_CONFIG = {
    "host": "localhost", "database": "royalty",
    "user": "postgres", "password": "password", "port": "5433"
}

def search_similar_trademark(search_text):
    analyzer = BrandAnalyzer()
    user_vec = analyzer.txt_model.encode(search_text).reshape(1, -1)
    
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    # 1. 이미 벡터화가 완료된 데이터만 가져오기
    print(f"🔎 '{search_text}'와 유사한 상표를 67만 개 데이터 중에서 찾는 중...")
    cur.execute("SELECT trademark_name, application_number, text_vector FROM patent WHERE text_vector IS NOT NULL")
    rows = cur.fetchall()
    
    if not rows:
        print("❌ 벡터화된 데이터가 없습니다. 인덱서를 더 돌려주세요!")
        return

    # 2. 유사도 계산
    results = []
    for name, app_num, vec in rows:
        score = cosine_similarity(user_vec, [vec])[0][0]
        results.append((name, app_num, score))
    
    # 3. 점수 높은 순으로 정렬
    results.sort(key=lambda x: x[2], reverse=True)
    
    print("\n[ 검색 결과 ]")
    for name, app_num, score in results[:5]:
        print(f"🎯 {name} ({app_num}) - 유사도: {score:.4f}")

if __name__ == "__main__":
    search_text = input("검색할 상표명을 입력하세요: ")
    search_similar_trademark(search_text)