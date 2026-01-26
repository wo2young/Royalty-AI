# 🦁 Royalty Project: 개발 환경 가이드 (AWS Migration Ver.)

![AWS RDS](https://img.shields.io/badge/AWS-RDS-232F3E?style=flat-square&logo=amazon-aws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Container-2496ED?style=flat-square&logo=docker&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=flat-square&logo=spring-boot&logoColor=white)
![Python](https://img.shields.io/badge/AI-FastAPI-3776AB?style=flat-square&logo=python&logoColor=white)

> 📢 **공지사항**
> **2026.01.25 부로 DB 서버가 로컬 Docker에서 `AWS RDS`로 이관되었습니다.**
> 기존 로컬 DB를 사용하던 분들은 **반드시** 아래 절차를 따라 환경을 재설정해주세요.

---

## 🛠️ 1. 필수 사전 준비 (Prerequisites)

작업을 시작하기 전에 소스코드를 최신화하고 설정을 변경해야 합니다.

### ① 코드 최신화
`develop` 브랜치의 최신 변경 사항을 당겨옵니다.
```bash
git pull origin develop
```

### ② Backend 설정 파일 교체 (중요!)
팀장님이 공유한 **`application.properties`** 파일을 아래 경로에 덮어씌워 주세요.
(AWS 접속 정보가 포함되어 있으므로 **외부 유출 절대 금지** 🚫)

```text
backend
 └── src
      └── main
           └── resources
                └── 📄 application.properties  <-- (이 파일을 교체하세요)
```

---

## 🐳 2. Docker 환경 재설정 (AI Model)

기존 로컬 DB(PostgreSQL 컨테이너)는 이제 사용하지 않습니다.
**구버전 컨테이너를 삭제**하고, AWS와 연결된 **신규 AI 모델**을 실행해야 합니다.

**터미널(프로젝트 루트)에서 순서대로 실행하세요:**

```bash
# 1. 실행 중인 모든 컨테이너 종료 및 삭제 (로컬 DB 삭제됨)
docker-compose down

# 2. 캐시 없이 새로 빌드 및 실행 (AWS 연결 버전)
docker-compose up -d --build
```

#### ✅ 정상 실행 확인 방법
```bash
docker ps
```
> 목록에 **`royalty-ai` 컨테이너 딱 1개만** 떠 있으면 성공입니다!
> (만약 `db` 관련 컨테이너가 보이면 `docker-compose down`을 다시 해주세요.)

---

## ☕ 3. Backend 실행 (Spring Boot)

1. sts4에서 `BackendApplication`을 실행합니다.
2. 콘솔 로그에 아래와 같은 AWS 접속 로그가 뜨는지 확인합니다.
   > `Connected to jdbc:postgresql://royalty...rds.amazonaws.com...`
3. **참고:** 이제 로컬 DB 주소(`localhost:5433`)는 사용하지 않습니다.

---

## ❓ 자주 묻는 질문 (FAQ)

<details>
<summary><strong>Q1. 로그인이 안 되고 '존재하지 않는 사용자'라고 떠요!</strong></summary>
<div markdown="1">
    <br>
    <strong>A.</strong> DB가 AWS로 바뀌면서 기존 로컬 데이터가 아닌 <strong>새로운 DB</strong>를 바라보게 되었습니다.
    따라서 회원 정보가 초기화된 상태입니다. <strong>새로 회원가입</strong>을 하시거나 테스트 계정을 생성해주세요.
</div>
</details>

<details>
<summary><strong>Q2. AI 검색이 작동하지 않아요!</strong></summary>
<div markdown="1">
    <br>
    <strong>A.</strong> <code>docker-compose up -d --build</code>를 실행하지 않아서, <strong>과거 설정(로컬 DB)을 가진 컨테이너</strong>가 돌고 있을 확률이 높습니다.
    반드시 <strong>재빌드(--build)</strong> 명령어를 실행해주세요.
</div>
</details>