# 1. 가벼운 파이썬 베이스 이미지 사용
FROM python:3.10-slim

# 시간대를 한국으로 설정하는 설정 추가
ENV TZ=Asia/Seoul
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 2. 필수 패키지 설치 (패키지명 수정)
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. 작업 디렉토리 설정
WORKDIR /app

# 4. 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. 소스 코드 및 모델 파일 복사
COPY src/ ./src/
# 주의: 모델 파일이 너무 크면 이 단계에서 복사하지 않고 볼륨(Volume)으로 연결하는 게 좋습니다.
# 일단은 포함하는 방식으로 작성하되, 용량이 수 GB라면 볼륨 연결로 바꿀게요!

# 6. 포트 설정
EXPOSE 8000

# 7. 실행 명령 (Uvicorn으로 FastAPI 실행)
CMD ["python", "src/main.py"]