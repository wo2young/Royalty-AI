-- ==========================================
-- [0] 필수 확장기능 (가장 먼저 실행!)
-- ==========================================
CREATE EXTENSION IF NOT EXISTS vector;  -- 이미지/텍스트 벡터 저장용
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- ★ 상표명 철자 유사도 검색용 (추가됨)

-- ==========================================
-- 1. 사용자 (Users) - 스프링 시큐리티 호환
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
    user_id      BIGSERIAL PRIMARY KEY,
    username     VARCHAR(50) NOT NULL UNIQUE,  -- ★ 아이디 (추가)
    password     VARCHAR(200) NOT NULL,        -- 비밀번호 (암호화)
    email        VARCHAR(100),                 -- ★ 이메일 (추가)
    role         VARCHAR(20) DEFAULT 'ROLE_USER', -- ★ 권한 (추가)
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2. 브랜드 (Brand)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand (
    brand_id     BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    brand_name   VARCHAR(100) NOT NULL,
    description  TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 3. 로고 (Brand Logo)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_logo (
    logo_id      BIGSERIAL PRIMARY KEY,
    brand_id     BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    image_path   TEXT NOT NULL,
    embedding    vector(512), -- 내 로고 벡터
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 5. 분석 결과 (Brand Analysis)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_analysis (
    analysis_id  BIGSERIAL PRIMARY KEY,
    brand_id     BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    image_score  FLOAT,
    text_score   FLOAT,
    risk_level   VARCHAR(20),
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 6. 특허/상표 데이터 (Patent) - ★ 핵심 수정됨
-- ==========================================
CREATE TABLE IF NOT EXISTS patent (
    patent_id           BIGSERIAL PRIMARY KEY,
    
    -- [수정] 50 -> 100으로 넉넉하게 변경
    application_number  VARCHAR(100) NOT NULL UNIQUE,
    
    trademark_name      TEXT NOT NULL,
    image_url           TEXT NOT NULL,
    applicant           TEXT,
    application_date    DATE,
    registered_date     DATE,
    
    -- [수정] VARCHAR(50) -> TEXT (무제한)으로 변경! ★여기가 핵심★
    category            TEXT,
    
    embedding           vector(512),
    text_embedding      vector(768),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- 검색 최적화 인덱스
CREATE INDEX idx_patent_app_date ON patent(application_date);
-- (데이터가 많아지면 벡터 인덱스도 추가 고려)

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
    detected_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 9. 북마크 (Bookmark)
-- ==========================================
CREATE TABLE IF NOT EXISTS bookmark (
    bookmark_id  BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    patent_id    BIGINT NOT NULL REFERENCES patent(patent_id) ON DELETE CASCADE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 10. 리포트 (Report)
-- ==========================================
CREATE TABLE IF NOT EXISTS report (
    report_id   BIGSERIAL PRIMARY KEY,
    brand_id    BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    file_path   TEXT, 
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 11. 상표 소멸 관리 (Trademark Expiration)
-- ==========================================
CREATE TABLE IF NOT EXISTS trademark_expiration (
    expiration_id    BIGSERIAL PRIMARY KEY,
    patent_id        BIGINT NOT NULL REFERENCES patent(patent_id) ON DELETE CASCADE,
    days_left        INT,
    status           VARCHAR(20), 
    last_checked_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 12. 브랜드 스타일 가이드 (Style Guide)
-- ==========================================
CREATE TABLE IF NOT EXISTS brand_style_guide (
    style_id      BIGSERIAL PRIMARY KEY,
    brand_id      BIGINT NOT NULL REFERENCES brand(brand_id) ON DELETE CASCADE,
    main_color_1  VARCHAR(20),
    main_color_2  VARCHAR(20),
    sub_color_1   VARCHAR(20),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 13. AI 네이밍 후보 (Naming Candidate)
-- ==========================================
CREATE TABLE IF NOT EXISTS naming_candidate (
    candidate_id    BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    keyword         TEXT,
    generated_name  VARCHAR(100),
    risk_signal     VARCHAR(20),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 1. 사용자 (Users)
-- 비밀번호 '1234'를 그대로 넣음.
-- 나중에 Spring Security 적용 전까지는 이걸로 로그인 테스트하세요.
INSERT INTO users (username, password, email, role) 
VALUES 
('admin', '1234', 'admin@royalty.com', 'ROLE_ADMIN'),
('tester', '1234', 'test@royalty.com', 'ROLE_USER')
ON CONFLICT (username) DO NOTHING;