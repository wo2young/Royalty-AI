## 🚀 AI 기반 상표 유사도 검색 엔진 (Royalty Project)
본 모듈은 KIPRIS로부터 수집된 100만 건 이상의 상표 데이터를 벡터화하고, 고속 유사도 검색(HNSW)을 제공하는 AI 검색 엔진입니다.

### 1. 데이터 현황
전체 데이터 수: 1,058,481건

주요 컬럼:

trademark_name: 상표명 (텍스트 검색 대상)

image_url: 상표 이미지 경로 (이미지 검색 대상)

text_vector: 768차원 임베딩 (Ko-SBERT)

image_vector: 1000차원 임베딩 (ResNet50)

### 2. AI 모델 스펙
Text Embedding: jhgan/ko-sbert-multitask (Sentence-BERT)

한국어 상표명의 문맥적 의미를 파악하여 768차원의 벡터로 변환합니다.

Image Embedding: ResNet50 (Pre-trained on ImageNet)

상표 이미지의 특징점(Feature)을 추출하여 1000차원의 벡터로 변환합니다.

### 3. 기술 스택
* **Database**: PostgreSQL 16.x + `pgvector` extension
* **Index**: HNSW (Hierarchical Navigable Small World)
* **Backend Interface**: Java (Spring Boot) + **MyBatis**
    * 복잡한 벡터 연산 및 검색 쿼리를 직접 제어하여 성능 최적화가 가능합니다.

### 4. MyBatis 매퍼(XML) 예시
```xml
<select id="searchSimilarTrademarks" resultType="TrademarkDTO">
    SELECT application_number, trademark_name, image_url
    FROM patent
    ORDER BY text_vector <![CDATA[<=>]]> #{inputVector, typeHandler=VectorTypeHandler}::vector
    LIMIT 10
</select>