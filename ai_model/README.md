# 🚀 AI 기반 상표 유사도 검색 엔진 (Royalty Project)

본 모듈은 KIPRIS로부터 수집된 100만 건 이상의 상표 데이터를 벡터화하고, 고속 유사도 검색(HNSW)을 제공하는 AI 검색 엔진입니다. **FastAPI**를 통해 실시간 임베딩 API를 제공하며, **APScheduler**를 통한 자동 최신화 기능을 포함합니다.

---

## 📊 1. 데이터 현황 및 AI 모델 스펙
- **전체 데이터 수**: 1,058,481건 (매일 자동 업데이트)
- **핵심 파이프라인**:
  - **Text Embedding**: `jhgan/ko-sbert-multitask` (768차원)
    - 한국어 상표명의 문맥적 의미를 파악하여 벡터화합니다.
  - **Image Embedding**: `ResNet50` (1000차원)
    - 상표 이미지의 시각적 특징점(Feature)을 추출합니다.
  - **Search Index**: PostgreSQL `pgvector` 기반 **HNSW** 인덱스 적용

---

## 🛠 2. 백엔드(Java/Spring) 연동 가이드
본 서버에서 반환하는 벡터 값을 활용하여 MyBatis에서 아래와 같이 검색을 수행할 수 있습니다.

### MyBatis 매퍼(XML) 예시
```xml
<select id="searchSimilarTrademarks" resultType="TrademarkDTO">
    SELECT application_number, trademark_name, image_url
    FROM patent
    ORDER BY text_vector <![CDATA[<=>]]> #{inputVector, typeHandler=VectorTypeHandler}::vector
    LIMIT 10
</select>
```
> **Tip**: `<=>` 연산자는 코사인 거리를 의미하며, 값이 작을수록 유사도가 높습니다.

---

## 🐳 3. AI API 서버 실행 방법 (Docker)

백엔드 개발자는 로컬 환경에 별도의 파이썬 설정 없이 **Docker**만으로 AI 서버를 기동할 수 있습니다.

### ① 사전 준비 (**Prerequisites**)
* **Docker Desktop** 설치 확인
* **KST 시간대 설정**: `Dockerfile` 내 `TZ=Asia/Seoul` 설정을 통해 한국 시간 동기화 완료.

### ② 이미지 빌드 및 컨테이너 실행
터미널에서 `ai_model` 폴더로 이동 후 아래 명령어를 입력하세요.

#### **1. 도커 이미지 빌드**
```bash
docker build -t royalty-ai-api .
```

#### **2. 컨테이너 실행 (Windows CMD 기준)**
```cmd
docker run -d --name royalty-ai-container -p 8000:8000 royalty-ai-api
```
> **⚠️ Note**: 저사양(**i3**) 환경을 위해 **모델 인스턴스 공유 최적화**가 적용되어 있습니다. 처음 실행 시 모델 다운로드로 인해 약 **1~2분의 준비 시간**이 소요될 수 있습니다.

---

## 🔄 4. 데이터 자동 최신화 (**Pipeline**)
본 서버는 별도의 조작 없이도 DB를 최신 상태로 유지합니다.

* **자동 업데이트**: 매일 **오후 2시(KST)**, 최근 **3일간**의 신규 상표 데이터를 수집 및 벡터화합니다.
* **중복 방지**: `application_number` 고유 키를 기반으로 중복 적재를 **원천 차단**합니다.
* **수동 트리거**: 관리자 페이지 테스트를 위해 **즉시 업데이트 API** (`/api/v1/update/now`)를 제공합니다.

---

## 📖 5. API 명세 및 테스트
서버 가동 후 브라우저에서 아래 주소에 접속하면 **Swagger UI**를 통해 API를 직접 테스트할 수 있습니다.

* **Swagger URL**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **주요 Endpoint**:
  * `POST /api/v1/embed/text`: **검색어(String)** -> 768차원 벡터 반환
  * `POST /api/v1/embed/image`: **이미지 파일** -> 1000차원 벡터 반환
  * `POST /api/v1/update/now`: **[신규]** 즉시 신규 상표 데이터 수집 및 업데이트 실행