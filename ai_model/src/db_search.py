import psycopg2
import psycopg2.extras
import os

class DBSearchEngine:
    def __init__(self):
        # Docker 환경 변수에서 읽어옴 (없으면 기본값)
        self.db_config = {
            "host": os.getenv("DB_HOST", "royalty.czikksygigvr.ap-northeast-2.rds.amazonaws.com"),
            "database": os.getenv("DB_NAME", "postgres"),
            "user": os.getenv("DB_USER", "postgres"),
            "password": os.getenv("DB_PASSWORD", "e9MbrDRLAqp2AES"),
            "port": os.getenv("DB_PORT", "5432"),
            "sslmode": "require"
        }

    def get_candidates(self, text_vec, img_vec=None, query_text=None):
        candidates = []
        try:
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    
                    # 1. 텍스트 벡터 검색 (후보 100개)
                    if text_vec is not None:
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   (1 - (text_vector <=> %s::vector)) as text_sim,
                                   0.0 as visual_sim 
                            FROM patent 
                            WHERE length(trademark_name) >= 2 
                            ORDER BY text_vector <=> %s::vector LIMIT 100
                        """, (text_vec.tolist(), text_vec.tolist()))
                        candidates.extend(cur.fetchall())

                    # 2. 이미지 벡터 검색 (후보 100개)
                    if img_vec is not None:
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   0.0 as text_sim,
                                   (1 - (image_vector <=> %s::vector)) as visual_sim
                            FROM patent 
                            WHERE image_vector IS NOT NULL
                            ORDER BY image_vector <=> %s::vector LIMIT 100
                        """, (img_vec.tolist(), img_vec.tolist()))
                        candidates.extend(cur.fetchall())

                    # 3. 키워드 검색 (보조)
                    if query_text and len(query_text) >= 2:
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   0.5 as text_sim, 
                                   0.0 as visual_sim
                            FROM patent
                            WHERE (trademark_name ILIKE %s)
                            LIMIT 50
                        """, (f"%{query_text}%",))
                        candidates.extend(cur.fetchall())

            # 중복 제거 (ID 기준) 및 점수 병합
            merged = {}
            for c in candidates:
                c_id = c['id']
                if c_id not in merged:
                    merged[c_id] = c
                else:
                    if c['text_sim'] > merged[c_id]['text_sim']: 
                        merged[c_id]['text_sim'] = c['text_sim']
                    if c['visual_sim'] > merged[c_id]['visual_sim']: 
                        merged[c_id]['visual_sim'] = c['visual_sim']
            
            return list(merged.values())

        except Exception as e:
            print(f"❌ DB Error: {e}")
            return []