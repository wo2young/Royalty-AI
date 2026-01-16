# 🚀 AI 기반 상표 유사도 검색 엔진 (Royalty Project)

본 모듈은 KIPRIS로부터 수집된 100만 건 이상의 상표 데이터를 벡터화하고, 고속 유사도 검색(HNSW)을 제공하는 AI 검색 엔진입니다. **FastAPI**를 통해 텍스트/이미지 임베딩 API를 제공하며, **Docker**를 통해 간편한 실행 환경을 지원합니다.

---

## 📊 1. 데이터 현황 및 AI 모델 스펙
- **전체 데이터 수**: 1,058,481건
- **핵심 파이프라인**:
  - **Text Embedding**: `jhgan/ko-sbert-multitask` (768차원)
    - 한국어 상표명의 문맥적 의미를 파악하여 벡터화합니다.
  - **Image Embedding**: `ResNet50` (1000차원)
    - 상표 이미지의 특징점(Feature)을 추출하여 벡터화합니다.
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

### ① 사전 준비 (Prerequisites)
1. **Docker Desktop** 설치 확인
2. **모델 파일(Heavy Data) 다운로드**: 
   - [구글 드라이브 링크]에서 `models/` 폴더를 다운로드합니다.
   - 다운로드한 폴더를 `ai_model/models/` 경로에 배치합니다. (용량 문제로 Git 제외)

### ② 이미지 빌드 및 컨테이너 실행
터미널에서 `ai_model` 폴더로 이동 후 아래 명령어를 입력하세요.

**1. 도커 이미지 빌드**
```bash
docker build -t royalty-ai-api .
```

**2. 컨테이너 실행 (Windows CMD 기준)**
```cmd
docker run -d --name royalty-ai-container -v "%cd%/models:/app/models" -p 8000:8000 royalty-ai-api
```

---

## 📖 4. API 명세 및 테스트
서버 가동 후 브라우저에서 아래 주소에 접속하면 **Swagger UI**를 통해 API를 직접 테스트할 수 있습니다.

- **Swagger URL**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **주요 Endpoint**:
  - `POST /api/v1/embed/text`: 검색어(String) -> 768차원 벡터 반환
  - `POST /api/v1/embed/image`: 이미지 파일 -> 1000차원 벡터 반환

---