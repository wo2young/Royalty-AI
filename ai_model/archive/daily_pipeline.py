import psycopg2
import psycopg2.extras

class DailyAutomation:
    def __init__(self, analyzer_instance=None):
        self.analyzer = analyzer_instance
        # [수정] 새 DB(5434) 연결 정보로 변경
        self.db_config = {
            "host": "host.docker.internal", # 로컬이면 localhost, 도커면 host.docker.internal
            "database": "postgres",         # [중요] 새 DB 이름 (postgres)
            "user": "postgres", 
            "password": "password", 
            "port": "5434"                  # [중요] 5433 -> 5434 변경
        }

    def get_candidates_from_db(self, text_vec, img_vec=None, query_text=None):
        candidates = []
        try:
            with psycopg2.connect(**self.db_config) as conn:
                with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                    
                    # 1. 텍스트 벡터 검색 (MobileNet 환경에서도 SBERT는 동일)
                    if text_vec is not None:
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   (1 - (text_vector <=> %s::vector)) as text_sim,
                                   0.0 as visual_sim 
                            FROM patent 
                            WHERE length(trademark_name) >= 2 
                            ORDER BY text_vector <=> %s::vector LIMIT 100; -- [변경] 후보군 100개로 확대
                        """, (text_vec.tolist(), text_vec.tolist()))
                        candidates.extend(cur.fetchall())

                    # 2. 이미지 벡터 검색 (1280차원 매칭)
                    if img_vec is not None:
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   0.0 as text_sim,
                                   (1 - (image_vector <=> %s::vector)) as visual_sim
                            FROM patent 
                            WHERE length(trademark_name) >= 2 
                              AND image_vector IS NOT NULL
                            ORDER BY image_vector <=> %s::vector LIMIT 100; -- [변경] 후보군 100개로 확대
                        """, (img_vec.tolist(), img_vec.tolist()))
                        candidates.extend(cur.fetchall())

                    # 3. 키워드 검색 (초성/포함 검색 강화)
                    if query_text and len(query_text) >= 2:
                        like_pattern = f"%{query_text}%"
                        first_char = query_text[0] # 첫 글자
                        
                        cur.execute("""
                            SELECT patent_id as id, trademark_name, image_url, category,
                                   0.5 as text_sim, 
                                   0.0 as visual_sim
                            FROM patent
                            WHERE (trademark_name ILIKE %s OR trademark_name LIKE %s)
                              AND length(trademark_name) >= 2
                            LIMIT 50;
                        """, (like_pattern, f"{first_char}%"))
                        candidates.extend(cur.fetchall())

            # [병합 로직 - 기존 유지]
            merged = {}
            for c in candidates:
                c_id = c['id']
                name = c.get('trademark_name', '').strip()
                if not name: continue

                t_sim = float(c.get('text_sim', 0.0))
                v_sim = float(c.get('visual_sim', 0.0))

                if c_id not in merged:
                    merged[c_id] = {
                        'id': c_id, 
                        'trademark_name': name, 
                        'image_url': c.get('image_url', ''),
                        'category': c.get('category', ''),
                        'text_sim': t_sim, 
                        'visual_sim': v_sim
                    }
                else:
                    if t_sim > merged[c_id]['text_sim']: merged[c_id]['text_sim'] = t_sim
                    if v_sim > merged[c_id]['visual_sim']: merged[c_id]['visual_sim'] = v_sim

            return list(merged.values())
        except Exception as e:
            print(f" [DB 검색 에러]: {str(e)}")
            return []