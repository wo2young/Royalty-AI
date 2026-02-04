# 1. Java 17 베이스 이미지
FROM openjdk:17-jdk-slim

# 2. 작업 폴더 설정
WORKDIR /app

# 3. 전체 파일 복사
COPY . .

# 4. mvnw 실행 권한 부여
RUN chmod +x ./mvnw

# 5. 빌드 (JAR 생성)
RUN ./mvnw clean package -DskipTests

# 6. 실행 (파일명이 뭐든 target 폴더 안의 jar를 실행)
# [꿀팁] 버전을 매번 수정하기 귀찮으니 *.jar로 찾아서 실행합니다.
CMD ["sh", "-c", "java -jar target/*.jar"]