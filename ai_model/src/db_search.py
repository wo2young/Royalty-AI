import psycopg2
import psycopg2.extras
import os
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------------
# [환경 변수 로드]
# ---------------------------------------------------------
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent.parent
env_path = root_dir / '.env'

if env_path.exists():
    load_dotenv(dotenv_path=env_path)

class DBSearchEngine:
    def __init__(self):
        # .env에서 DB 정보 로드
        self.db_config = {
            "host": os.getenv("DB_HOST"),
            "database": os.getenv("DB_NAME"),
            "user": os.getenv("DB_USER"),
            "password": os.getenv("DB_PASSWORD"),
            "port": os.getenv("DB_PORT", "5432"),
            "sslmode": "require"
        }

    def get_candidates(self, text_vec, img_vec=None, query_text=None):
        candidates = []
        try:
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    
                    # ---------------------------------------------------------
                    # [Rule] 0. 텍스트 완전 일치 검색 (점수 1.0 부여)
                    # ---------------------------------------------------------
                    if query_text:
                        clean_query = query_text.strip()
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   1.0 as text_sim,
                                   0.0 as visual_sim 
                            FROM patent 
                            WHERE trademark_name ILIKE %s
                        """, (clean_query,))
                        candidates.extend(cur.fetchall())

                    # ---------------------------------------------------------
                    # 1. 텍스트 벡터 검색
                    # ---------------------------------------------------------
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

                    # ---------------------------------------------------------
                    # 2. 이미지 벡터 검색
                    # ---------------------------------------------------------
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

                    # ---------------------------------------------------------
                    # 3. 키워드 포함 검색 (보조)
                    # ---------------------------------------------------------
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

            # ---------------------------------------------------------
            # 4. 점수 병합 (최대 점수 채택)
            # ---------------------------------------------------------
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