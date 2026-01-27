-- ==========================================
-- [Royalty Team] AWS DB Schema Archive
-- 작성이: 사용자 & Gemini
-- 설명: AWS RDS의 최종 배포 상태를 기록한 설계도입니다.
-- 주의: 이미 배포된 DB에 이 스크립트를 직접 실행하지 마세요. (참고용)
-- ==========================================

-- [0] 기본 설정
SET TIME ZONE 'Asia/Seoul';

-- 필수 확장기능
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ==========================================
-- 1. 사용자 (Users)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    user_id      BIGSERIAL PRIMARY KEY,
    username     VARCHAR(50) NOT NULL UNIQUE,
    password     VARCHAR(200) NOT NULL,
    email        VARCHAR(100),
    role         VARCHAR(20) DEFAULT 'ROLE_USER',
    provider         VARCHAR(20),
    provider_id      VARCHAR(100),
    created_at   TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. 브랜드 (Brand)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand (
    brand_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    brand_name   VARCHAR(100) NOT NULL,
    category     VARCHAR(50),
    text_vector vector(768),
    description  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    is_notification_enabled  BOOLEAN DEFAULT FALSE;
);

-- ==========================================
-- 3. 로고 (Brand Logo)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_logo (
    logo_id      BIGSERIAL PRIMARY KEY,
    brand_id     BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    image_path   TEXT NOT NULL,
    -- [중요] AI 모델(MobileNetV2 등) 출력에 맞춰 1280차원 설정
    image_vector vector(1280),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 4. 로고 히스토리
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_logo_history (
    history_id       BIGSERIAL PRIMARY KEY,
    brand_id         BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    version          VARCHAR(50),
    image_path       TEXT NOT NULL,
    image_similarity FLOAT,
    text_similarity  FLOAT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. 분석 결과
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_analysis (
    analysis_id  BIGSERIAL PRIMARY KEY,
    brand_id     BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    image_score  FLOAT,
    text_score   FLOAT,
    risk_level   VARCHAR(20),
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
    application_date    VARCHAR(20),   -- 출원일
    registration_date   VARCHAR(20),   -- 등록일
    status              VARCHAR(50),   -- 법적 상태 (등록, 거절 등)
    category            TEXT,          -- 지정상품 분류
    -- [AI 벡터 데이터]
    image_vector        vector(1280),  -- MobileNetV3 (1280차원)
    text_vector         vector(768),   -- SBERT (768차원)
    created_at          TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- [인덱스 아카이브]
-- 1. 날짜 및 상태 조회용 B-Tree
CREATE INDEX IF NOT EXISTS idx_patent_app_date ON patent(application_date);
CREATE INDEX IF NOT EXISTS idx_patent_status ON patent(status);

-- 2. 벡터 검색용 IVFFlat 인덱스 (AWS 적용 완료)
-- lists=400 옵션은 데이터 32만 개 기준 최적화 값
CREATE INDEX IF NOT EXISTS patent_image_vector_idx ON patent USING ivfflat (image_vector vector_cosine_ops) WITH (lists = 400);
CREATE INDEX IF NOT EXISTS patent_text_vector_idx ON patent USING ivfflat (text_vector vector_cosine_ops) WITH (lists = 400);

-- ==========================================
-- 7. 감지 이벤트 (Detection Event)
-- ==========================================
CREATE TABLE IF NOT EXISTS detection_event (
    event_id         BIGSERIAL PRIMARY KEY,
    brand_id         BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    patent_id        VARCHAR(100) NOT NULL REFERENCES patent(application_number) ON DELETE CASCADE, 
    image_similarity FLOAT,
    text_similarity  FLOAT,
    risk_level       VARCHAR(20),
    detected_at      TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
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
    patent_id    VARCHAR(100) NOT NULL REFERENCES patent(application_number) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, patent_id)
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
-- 11. 토큰 관리 
-- ==========================================
CREATE TABLE IF NOT EXISTS trademark_expiration (
    expiration_id    BIGSERIAL PRIMARY KEY,
    patent_id        VARCHAR(100) NOT NULL REFERENCES patent(application_number) ON DELETE CASCADE,
    days_left        INT,
    status           VARCHAR(20), 
    last_checked_at  TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 12. FCM 토큰 관리 (Push Notification)
-- ==========================================
CREATE TABLE IF NOT EXISTS fcm_token (
    fcm_token_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, token)
);