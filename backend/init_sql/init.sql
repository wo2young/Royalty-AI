-- ==========================================
-- [0] 기본 설정 (시간대 및 확장기능)
-- ==========================================
-- 1. 한국 시간대 설정 (DB 세션 레벨)
SET TIME ZONE 'Asia/Seoul';

-- 2. 필수 확장기능 활성화
CREATE EXTENSION IF NOT EXISTS vector;  -- 벡터 연산용 (필수)
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- 텍스트 유사도 검색용

-- ==========================================
-- 1. 사용자 (Users)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    user_id      BIGSERIAL PRIMARY KEY,
    username     VARCHAR(50) NOT NULL UNIQUE,
    password     VARCHAR(200) NOT NULL,
    email        VARCHAR(100),
    role         VARCHAR(20) DEFAULT 'ROLE_USER',
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. 브랜드 (Brand) - 사용자가 등록한 브랜드
-- ==========================================
CREATE TABLE IF NOT EXISTS brand (
    brand_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    brand_name   VARCHAR(100) NOT NULL,
    description  TEXT,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. 로고 (Brand Logo)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_logo (
    logo_id      BIGSERIAL PRIMARY KEY,
    brand_id     BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    image_path   TEXT NOT NULL,
    image_vector vector(1000), -- ResNet50 (1000차원)
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. 로고 히스토리 (Brand Logo History)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_logo_history (
    history_id       BIGSERIAL PRIMARY KEY,
    brand_id         BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    version          VARCHAR(50),
    image_path       TEXT NOT NULL,
    image_similarity FLOAT,
    text_similarity  FLOAT,
    created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. 분석 결과 (Brand Analysis)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_analysis (
    analysis_id  BIGSERIAL PRIMARY KEY,
    brand_id     BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    image_score  FLOAT,
    text_score   FLOAT,
    risk_level   VARCHAR(20), -- 'HIGH', 'MEDIUM', 'LOW'
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. 특허/상표 데이터 (Patent) - ★ 핵심 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS patent (
    patent_id           BIGSERIAL PRIMARY KEY,
    application_number  VARCHAR(100) NOT NULL UNIQUE, -- 출원번호 (고유키)
    
    trademark_name      TEXT NOT NULL, -- 상표명
    image_url           TEXT,          -- 이미지 URL
    
    applicant           TEXT,          -- 출원인
    application_date    DATE,          -- 출원일
    registered_date     DATE,          -- 등록일
    status              VARCHAR(50),   -- 법적 상태 (등록, 거절 등)
    category            TEXT,          -- 지정상품 분류
    
    -- [AI 벡터 데이터]
    image_vector        vector(1000),  -- ResNet50 (1000차원)
    text_vector         vector(768),   -- SBERT (768차원)
    
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [인덱스 최적화]
-- 1. 날짜 조회용 B-Tree 인덱스
CREATE INDEX IF NOT EXISTS idx_patent_app_date ON patent(application_date);
CREATE INDEX IF NOT EXISTS idx_patent_status ON patent(status);

-- 2. 벡터 검색용 HNSW 인덱스 (검색 속도 100배 향상)
CREATE INDEX IF NOT EXISTS idx_patent_image_vec ON patent USING hnsw (image_vector vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_patent_text_vec ON patent USING hnsw (text_vector vector_cosine_ops);

-- ==========================================
-- 7. 감지 이벤트 (Detection Event)
-- ==========================================
CREATE TABLE IF NOT EXISTS detection_event (
    event_id         BIGSERIAL PRIMARY KEY,
    brand_id         BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    patent_id        BIGINT NOT NULL REFERENCES patent(patent_id) ON DELETE CASCADE, 
    image_similarity FLOAT,
    text_similarity  FLOAT,
    risk_level       VARCHAR(20),
    detected_at      TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 8. 알림 (Notification)
-- ==========================================
CREATE TABLE IF NOT EXISTS notification (
    notification_id  BIGSERIAL PRIMARY KEY,
    user_id          BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    brand_id         BIGINT REFERENCES brand(brand_id) ON DELETE CASCADE,
    event_id         BIGINT REFERENCES detection_event(event_id) ON DELETE SET NULL,
    message          TEXT,
    is_read          BOOLEAN DEFAULT FALSE,
    created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. 북마크 (Bookmark)
-- ==========================================
CREATE TABLE IF NOT EXISTS bookmark (
    bookmark_id  BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    patent_id    BIGINT NOT NULL REFERENCES patent(patent_id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, patent_id) -- 중복 북마크 방지
);

-- ==========================================
-- 10. 리포트 (Report)
-- ==========================================
CREATE TABLE IF NOT EXISTS report (
    report_id   BIGSERIAL PRIMARY KEY,
    brand_id    BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    file_path   TEXT, 
    created_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 11. 상표 소멸 관리 (Trademark Expiration)
-- ==========================================
CREATE TABLE IF NOT EXISTS trademark_expiration (
    expiration_id    BIGSERIAL PRIMARY KEY,
    patent_id        BIGINT NOT NULL REFERENCES patent(patent_id) ON DELETE CASCADE,
    days_left        INT,
    status           VARCHAR(20), 
    last_checked_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);