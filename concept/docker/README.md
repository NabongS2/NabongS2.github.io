# Docker — 개념과 Dockerfile 작성

컨테이너가 뭔지, Dockerfile 을 어떻게 쓰는지, 빌드해서 띄우기까지.
**예제는 자바 기준이다.** 스프링 부트로 만든 실행 가능한 `.jar` 하나를 컨테이너에 올린다고 보면 된다.

- 그림 소스: `src/*.svg` (한국어), `src/en/*.svg` (영어). 색은 CSS 변수, 다크는 `@media (prefers-color-scheme: dark)`
- 생성물: SVG 는 이 폴더에, PNG 는 `src/assets/blog/docker/` 로 나간다. `src/` 의 폴더 구조가 그대로 이어진다
- 글에서 쓰는 법: `<ThemedImage name="docker/vm-vs-docker" alt="..." />` (영어는 `docker/en/...`)
- 미리보기: `index.html` 을 브라우저로 연다
- 예제: `examples/Dockerfile`, `examples/Dockerfile.multistage`, `examples/docker_run.sh`, `examples/.dockerignore`

```sh
# gitblog 루트에서
node concept/docker/build-images.mjs
```

PNG 를 뽑는 librsvg 는 CSS 변수를 못 읽어서, 변수를 실제 색으로 바꾼 두 벌을 미리 만들어 둔다.

> **생성물은 직접 고치지 않는다.** `*-light.svg` · `*-dark.svg` · `*.png` 는 전부 스크립트가 덮어쓴다. 고칠 것이 있으면 `src/` 의 원본을 고치고 위 명령을 다시 돌린다.

---

## 1. 도커가 뭔가

서버마다 똑같은 환경을 만들어 주는 도구다. "내 PC 에서는 됐는데요" 를 없애는 게 목적이다.

흔한 오해 하나. **도커는 하이퍼바이저를 기반으로 하지 않는다.** 오히려 그 반대다.

| | 가상 머신 | 컨테이너 |
| --- | --- | --- |
| 아래에 깔리는 것 | 하이퍼바이저 | Docker 엔진 |
| OS | 게스트 OS 를 앱마다 한 벌씩 | 호스트 커널을 같이 씀 |
| 크기 | 수 GB | 수십~수백 MB |
| 뜨는 시간 | 분 | 초 |

가벼운 이유가 바로 이것이다. 컨테이너는 OS 를 새로 켜지 않고 호스트 커널을 리눅스의 namespace·cgroup 으로 갈라 쓴다. 그래서 VM 보다 빠르고 밀도가 높다.

![VM 과 컨테이너 비교](vm-vs-docker-light.svg)

### 이미지와 컨테이너

**이미지**는 앱을 돌리는 데 필요한 모든 것 — 코드, 런타임, 시스템 도구, 라이브러리, 설정 — 을 한 덩어리로 묶은 패키지다. 읽기 전용이라 몇 번을 실행해도 내용이 변하지 않는다.

**컨테이너**는 그 이미지를 떠서 실제로 돌리는 프로세스다. `stop` 하고 `rm` 해도 이미지는 그대로 남는다. 이미지가 붕어빵 틀이고 컨테이너가 붕어빵이라는 비유가 여기서 나온다.

```
Dockerfile ──build──▶ Image ──run──▶ Container
```

![도커 개념](docker-concept-light.svg)

---

## 2. Dockerfile 만드는 법

Dockerfile 은 이미지에 무엇을 어떻게 담을지 한 파일에 적어 둔 명령 파일이다. **한 줄이 레이어 한 장**이 되고, 아래에서 위로 쌓인다.

![Dockerfile 레이어](dockerfile-layers-light.svg)

자바 앱이면 결국 이 네 가지만 정하면 된다.

1. **어떤 런타임 위에 올릴 것인가** → `FROM`
2. **jar 를 어디에 둘 것인가** → `WORKDIR` + `COPY`
3. **어떻게 실행할 것인가** → `ENTRYPOINT`
4. **무엇을 이미지에 넣지 않을 것인가** → `.dockerignore`

### 주요 명령어

| 명령 | 하는 일 |
| --- | --- |
| `FROM` | 바닥에 깔 base 이미지. 보통 맨 윗줄 |
| `ARG` | **빌드할 때만** 쓰는 변수. 이미지 안에는 안 남는다 |
| `ENV` | **컨테이너에서** 쓸 환경 변수. 빌드 중에도 쓰인다 |
| `WORKDIR` | 이후 명령이 실행될 작업 폴더. 없으면 만들어 준다 |
| `COPY` | 호스트 파일을 이미지 안으로 복사 |
| `ADD` | COPY 의 상위 호환. 압축 해제, 원격 URL 까지 되지만 그럴 일 아니면 COPY 를 쓴다 |
| `RUN` | 빌드 중에 실행할 명령 (패키지 설치, 빌드 등) |
| `EXPOSE` | 이 컨테이너가 쓰는 포트를 문서처럼 알림. 실제로 열어주지는 않는다 |
| `ENTRYPOINT` | 컨테이너가 뜰 때 **항상** 실행할 커맨드 |
| `CMD` | ENTRYPOINT 에 붙일 기본 인자. 단독으로 쓰면 기본 커맨드 |
| `USER` | 이후 명령과 실행을 맡을 계정. 안 쓰면 root 로 돈다 |

### 가장 단순한 형태

이미 만들어진 jar 가 손에 있을 때. 빌드는 밖에서 하고 도커는 담기만 한다.

```dockerfile
FROM eclipse-temurin:17-jre

ARG JAR_FILE=./myapp.jar

ENV TZ=Asia/Seoul
ENV JAVA_OPTS=""

WORKDIR /app
COPY ${JAR_FILE} ./app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -jar /app/app.jar"]
```

전체는 [`examples/Dockerfile`](examples/Dockerfile) 에 있다.

> **base 이미지 고르기.** 예전에 흔히 쓰던 `openjdk` 공식 이미지는 지금 더 갱신되지 않는다. 새로 쓸 거면 `eclipse-temurin` 쪽이 무난하다. 태그 끝의 `-jre` 는 실행만 되는 버전이라 컴파일러가 빠져 가볍다. 빌드까지 안에서 할 게 아니면 `-jdk` 대신 `-jre` 를 고른다.

### 빌드까지 안에서 하기 — 멀티 스테이지

jar 가 없는 상태에서 소스만 주고 이미지를 만들고 싶을 때 쓴다. 빌드하는 단계와 실행하는 단계를 따로 두고, 최종 이미지에는 결과물만 남긴다.

```dockerfile
# 1단계: 빌드
FROM gradle:8-jdk17 AS build
WORKDIR /src

# 의존성 목록만 먼저 넣고 받아 둔다.
# 소스만 바뀌었을 때 이 레이어를 다시 안 만든다.
COPY build.gradle settings.gradle ./
RUN gradle dependencies --no-daemon || true

COPY src ./src
RUN gradle bootJar --no-daemon

# 2단계: 실행
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /src/build/libs/*.jar ./app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

전체는 [`examples/Dockerfile.multistage`](examples/Dockerfile.multistage) 에 있다.

핵심은 **마지막 `FROM` 부터가 최종 이미지**라는 것이다. 1단계의 Gradle, JDK, 소스, 캐시는 이미지에 안 들어간다. `COPY --from=build` 로 결과물만 건너온다. JDK 와 빌드 도구가 통째로 빠지니 최종 이미지가 크게 줄어든다.

### 쓰면서 걸리는 것들

- **`ENTRYPOINT` 의 두 가지 형태.** `["java", "-jar", "app.jar"]` 같은 exec 형태가 기본이다. 셸을 거치지 않아 시그널이 자바 프로세스에 바로 꽂히고, `docker stop` 이 보낸 `SIGTERM` 을 앱이 받아 정상 종료한다. 대신 `${JAVA_OPTS}` 같은 변수가 **펼쳐지지 않는다.** 변수를 써야 해서 `sh -c` 로 감쌀 때는 `exec java ...` 라고 써서 자바가 셸 프로세스를 대체하게 만든다. 안 그러면 셸이 1번 프로세스로 남아 시그널을 자바에 안 넘긴다.
- **힙 크기는 Dockerfile 에 고정해 두지 않는다.** 자바는 보이는 메모리의 1/4 을 힙 최대치로 잡는다. 컨테이너에 한도가 있으면 그 한도가, 없으면 서버 전체가 보인다 (자바 10 이상). 서버에 컨테이너가 하나뿐이면 그대로 둬도 된다. 여러 개가 같이 돌면 각자 서버 전체의 1/4 을 잡아 합이 서버를 넘기므로, `docker run -m` 으로 한도를 나눠 주고 비율만 `-XX:MaxRAMPercentage` 로 올린다. `-Xmx` 같은 고정 숫자는 한도를 안 따라가서 두 군데가 어긋난다.
- **타임존.** base 이미지는 대개 UTC 다. 로그 시각이 9시간 어긋나 보이면 `ENV TZ=Asia/Seoul` 을 확인한다.
- **`ARG` 와 `ENV` 는 다른 것이다.** `ARG` 는 `docker build --build-arg` 로 넘기고 빌드가 끝나면 사라진다. `ENV` 는 이미지에 남아서 컨테이너 안에서도 보인다. 비밀번호를 `ENV` 에 넣으면 이미지를 받은 누구나 `docker inspect` 로 본다.
- **자주 바뀌는 줄은 아래에.** 레이어 캐시는 위에서부터 같은 데까지 재사용된다. `COPY app.jar` 를 맨 아래 두면 jar 만 바뀌었을 때 그 위 레이어를 다시 안 만든다.
- **`.dockerignore` 를 둔다.** 없으면 빌드 컨텍스트로 폴더 전체가 데몬에 올라간다. `.git`, `build`, `.gradle` 만 빼도 전송량이 크게 준다. [`examples/.dockerignore`](examples/.dockerignore) 참고.
- **root 로 돌리지 않기.** 운영에 올릴 이미지면 전용 계정을 만들고 `USER` 로 내려선다.

---

## 3. 빌드하고 띄우기

![빌드하고 띄우는 순서](docker-build-flow-light.svg)

### 1) 치우기

같은 이름·같은 태그를 다시 쓰려면 먼저 비운다.

```sh
docker ps                      # 실행 중인 컨테이너
docker ps -a                   # 멈춘 것까지 전부
docker stop myapp              # 멈추고
docker rm   myapp              # 지운다 (멈춰야 지워진다)

docker images                  # 이미지 목록
docker image rm 1a2b3c4d5e6f   # 이미지ID 나 이미지명:태그
```

이미지가 안 지워지면 대개 그 이미지를 쓰는 컨테이너가 남아 있는 것이다. `docker ps -a` 로 확인하고 컨테이너부터 지운다.

### 2) 빌드

`Dockerfile` 이 있는 폴더로 가서 빌드한다.

```sh
cd {프로젝트 폴더}
docker build -t myapp:1.0 .
```

- `-t myapp:1.0` — 이름:태그. 태그를 안 주면 `latest` 가 붙는다.
- 맨 끝 `.` — 빌드 컨텍스트, 곧 현재 폴더. 빠뜨리기 쉽다.
- `--no-cache` — 캐시를 전부 버리고 바닥부터 다시 만든다. 평소엔 필요 없고 오히려 느리다. 파일 내용이 바뀌었는데 경로와 이름이 같아 캐시가 옛것을 잡고 있는 것 같을 때만 쓴다.

### 3) 실행과 확인

```sh
docker run -d --name myapp -p 8080:8080 myapp:1.0

docker ps
docker logs -f myapp           # 처음부터 계속 따라붙기
docker logs -f -n 100 myapp    # 최근 100줄부터 따라붙기
```

`-f` 는 새 로그를 계속 받아 본다. `Ctrl+C` 로 빠져나와도 컨테이너는 계속 돈다.

---

## 4. docker run 을 스크립트로 묶기

옵션이 서너 줄을 넘어가면 손으로 치다가 포트를 빠뜨리거나 볼륨 경로를 틀린다. 스크립트에 묻어 두고 그것만 실행한다.

```sh
#!/bin/bash
set -euo pipefail

NAME=myapp
VERSION="${1:-1.0}"
IMAGE="${NAME}:${VERSION}"
APP_HOME="/opt/${NAME}"

# 같은 이름이 남아 있으면 먼저 치운다
if [ -n "$(docker ps -aq -f "name=^/${NAME}$")" ]; then
  docker stop "${NAME}" >/dev/null 2>&1 || true
  docker rm   "${NAME}" >/dev/null
fi

docker run -d \
  --name "${NAME}" \
  --restart unless-stopped \
  -p 8080:8080 \
  -e TZ=Asia/Seoul \
  -e SPRING_PROFILES_ACTIVE=prod \
  -v "${APP_HOME}/log:/app/log" \
  -v "${APP_HOME}/config:/app/config" \
  "${IMAGE}"

docker ps -f "name=${NAME}"
```

전체는 [`examples/docker_run.sh`](examples/docker_run.sh) 에 있다.

### 옵션 뜻

| 옵션 | 뜻 |
| --- | --- |
| `-d` | 백그라운드로 띄운다 |
| `--name` | 컨테이너 이름. 안 주면 도커가 아무 이름이나 붙인다 |
| `--restart unless-stopped` | 서버가 재부팅돼도 다시 뜬다 |
| `-p 8080:8080` | `호스트포트:컨테이너포트` |
| `-v /etc/localtime:/etc/localtime:ro` | 호스트 시각을 그대로 쓰는 방법. `-e TZ` 대신 쓰기도 한다 |
| `-m 1g` | 메모리 한도. 여러 컨테이너가 한 호스트를 나눠 쓸 때만 필요하다 |
| `-e KEY=VALUE` | 환경 변수. Dockerfile 의 `ENV` 를 덮어쓴다 |
| `-v 호스트경로:컨테이너경로` | 볼륨 마운트 |

### 볼륨을 쓰는 이유

컨테이너를 `rm` 하면 그 안에 쓴 파일은 같이 사라진다. 로그와 설정처럼 살아남아야 하는 것은 호스트 폴더에 마운트해 둔다. 그래야 컨테이너를 몇 번을 갈아 끼워도 남는다.

로그를 파일로도 쌓는다면 (logback·log4j2 의 File Appender) 그 경로를 볼륨으로 빼 둔다. 컨테이너 안에만 쌓이면 디스크만 먹다가 컨테이너와 함께 사라진다.

---

## 5. .tar 로 옮기기

인터넷이나 레지스트리가 안 닿는 서버에는 이미지를 파일로 옮긴다.

```sh
# 내보내는 쪽
docker save -o myapp.tar myapp:1.0

# 받는 쪽
docker load -i myapp.tar
docker images                     # 태그까지 그대로 복원됐는지 확인
```

- `docker save` 는 **이미지**를, `docker export` 는 **컨테이너의 파일시스템**을 뽑는다. 이미지를 옮길 때는 `save` 다. `export` 로 뽑으면 레이어와 `ENTRYPOINT` 같은 메타데이터가 다 날아가서 그대로는 못 띄운다.
- tar 는 압축이 아니라 묶음이라 용량이 크다. 필요하면 `docker save myapp:1.0 | gzip > myapp.tar.gz` 로 줄인다.
- `load` 는 이미지만 되살린다. 컨테이너는 `docker run` 으로 다시 띄워야 한다.

---

## 6. 명령어 한눈에

| 하려는 것 | 명령 |
| --- | --- |
| 실행 중인 컨테이너 | `docker ps` |
| 멈춘 것까지 전부 | `docker ps -a` |
| 컨테이너 정지 | `docker stop {컨테이너명}` |
| 컨테이너 삭제 | `docker rm {컨테이너명}` |
| 이미지 목록 | `docker images` |
| 이미지 삭제 | `docker image rm {이미지ID}` |
| 이미지 빌드 | `docker build -t {이름}:{태그} .` |
| 컨테이너 실행 | `docker run -d --name {이름} -p 8080:8080 {이미지명}:{태그}` |
| 로그 전체 | `docker logs -f {컨테이너명}` |
| 로그 최근 100줄 | `docker logs -f -n 100 {컨테이너명}` |
| 컨테이너 안으로 들어가기 | `docker exec -it {컨테이너명} /bin/bash` |
| 상세 설정 보기 | `docker inspect {컨테이너명}` |
| 자원 사용량 | `docker stats {컨테이너명}` |
| 이미지를 파일로 | `docker save -o {파일명}.tar {이미지명}:{태그}` |
| 파일에서 이미지로 | `docker load -i {파일명}.tar` |
| 안 쓰는 것 정리 | `docker system prune` |
