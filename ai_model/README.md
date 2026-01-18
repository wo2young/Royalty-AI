# 🚀 Royalty AI - Hybrid Trademark Search Engine

> **인공지능 기반 상표권 침해 분석 하이브리드 검색 엔진**
>
> 텍스트의 **'의미(Semantics)'**와 이미지의 **'시각적 유사도(Visual Similarity)'**, 그리고 **'철자 정확도'**를 결합하여 최적의 유사 상표를 탐지합니다. **i3 CPU / 8GB RAM** 환경에서도 100만 건 데이터를 실시간으로 처리할 수 있도록 최적화되었습니다.

---

## 📊 1. 핵심 기능 및 AI 모델 스펙
**전체 데이터**: 1,058,481건+ (KIPRIS 연동 / 매일 자동 업데이트)

### 🧠 Hybrid Search Engine (3-Stage Filtering)
본 엔진은 단순 벡터 검색을 넘어, 다음 3단계 프로세스를 거쳐 결과를 도출합니다.

1.  **Candidate Retrieval (후보군 추출)**
    * **Vector Search**: `Ko-SBERT`(의미)와 `ResNet50`(시각) 벡터로 상위 50개 후보 추출
    * **Keyword Search (Fallback)**: 벡터가 놓칠 수 있는 정확한 키워드 매칭을 위해 `ILIKE` 검색으로 보완 (예: "나이키" vs "NIKE")
2.  **Smart Deduplication (지능형 중복 제거)**
    * 대기업(삼성, 카카오, 쿠팡 등)의 문어발식 상표 등록으로 인한 **검색 결과 도배 현상을 원천 차단**합니다.
    * 가장 유사도가 높은 대표 상표 1건만 노출하고 나머지는 필터링하여 사용자에게 다양한 결과를 제공합니다.
3.  **Hybrid Re-Ranking (정밀 재정렬)**
    * **Text (20~30%)**: `jhgan/ko-sroberta-multitask` (의미적 유사성, 예: 우유 ↔ Milk)
    * **Image (40~100%)**: `ResNet50` (로고의 형태, 색감, 기하학적 구조 유사성)
    * **Spelling (30~80%)**: `Levenshtein Distance` (오타 및 철자 유사성, 예: 무신사 ↔ 무신사인)

---

## 🛠 2. 백엔드 연동 가이드 (API Usage)

**기존의 MyBatis 직접 조회 방식이 아닌, AI 서버의 하이브리드 API를 호출해야 "중복 제거" 및 "복합 점수" 로직이 적용됩니다.**

### 🔍 통합 검색 API (Hybrid Search)
* **Endpoint**: `POST /api/v1/search/hybrid`
* **Content-Type**: `multipart/form-data`

| 파라미터 | 타입 | 필수 여부 | 설명 |
|---|---|---|---|
| `query_text` | String | Optional | 검색할 상표명 (예: "이디야") |
| `file` | File | Optional | 상표 로고 이미지 파일 |

#### **Response Example (JSON)**
```json
{
  "status": "success",
  "results": [
    {
      "id": 1838589,
      "score": 1.08,  // 1.0 이상은 '완벽 일치'를 의미
      "name": "무신사",
      "details": {
        "v": 0.0,     // Visual (이미지 점수)
        "t": 1.0,     // Text (의미 점수)
        "s": 1.1      // Spell (철자 점수 + 보너스)
      }
    },
    {
      "id": 1931029,
      "score": 0.84,
      "name": "무신사인",
      "details": { "..." }
    }
  ]
}
```

---

## ⚙️ 3. 데이터베이스 설정 (pgvector & HNSW)
대규모 데이터(100만 건)를 저사양 환경에서 검색하기 위해 **HNSW 인덱스** 최적화가 필수입니다. PostgreSQL에서 아래 명령어를 실행해야 합니다.

```sql
-- 1. pgvector 확장 활성화
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 텍스트 벡터 인덱스 (100만 건 최적화 파라미터)
CREATE INDEX idx_patent_text_vector 
ON patent USING hnsw (text_vector vector_l2_ops) 
WITH (m = 16, ef_construction = 64);

-- 3. 이미지 벡터 인덱스
CREATE INDEX idx_patent_image_vector 
ON patent USING hnsw (image_vector vector_l2_ops) 
WITH (m = 16, ef_construction = 64);
```
> **Performance Note**: `m=16`, `ef=64` 설정은 **i3/8GB** 환경에서 메모리 오버헤드를 줄이면서도 검색 정확도를 유지하는 최적값입니다.

---

## 🐳 4. AI 서버 실행 방법 (Docker)

### ① 사전 준비 (**Prerequisites**)
* **Docker Desktop** 설치 확인
* **KST 시간대 설정**: `Dockerfile` 내 `TZ=Asia/Seoul` 설정을 통해 한국 시간 동기화 완료.
* **모델 파일**: 하단에 제공된 링크에서 `models/` 폴더를 다운로드하여 `ai_model/models/` 경로에 배치 (약 1~2GB)
* **구글 드라이브 주소**: [(https://drive.google.com/open?id=1v57YvD03yyo_OzhZgfrf2h3MHd2AdlcV&usp=drive_fs)]
### ② 실행 명령어
터미널에서 `ai_model` 폴더로 이동 후 실행하세요.

#### **1. 도커 이미지 빌드**
```bash
docker build -t royalty-ai-api .
```

#### **2. 컨테이너 실행**
```bash
# -d: 백그라운드 실행, -p: 포트 연결
docker run -d --name royalty-ai-container -p 8000:8000 royalty-ai-api
```
> **⚠️ 초기 구동 주의**: `ResNet50` 및 `Ko-SBERT` 모델을 로드하는 데 약 30초~1분이 소요될 수 있습니다.

---

## 🔄 5. 자동화 파이프라인 (Automation)
본 서버는 별도의 조작 없이도 DB를 최신 상태로 유지합니다.

* **스케줄러**: `APScheduler` 내장
* **작동 시간**: 매일 **오후 2시 (KST)**
* **기능**:
    1.  KIPRIS 최근 3일치 신규 데이터 수집
    2.  텍스트/이미지 벡터 변환
    3.  DB 적재 (중복 `application_number` 자동 스킵)
* **수동 업데이트**: `POST /api/v1/update/now` 호출 시 즉시 실행

---

## 📖 6. 테스트 (Swagger UI)
서버 실행 후 브라우저에서 아래 주소로 접속하여 테스트할 수 있습니다.
* **URL**: [http://localhost:8000/docs](http://localhost:8000/docs)