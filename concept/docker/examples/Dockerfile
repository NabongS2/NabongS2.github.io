# 이미 만들어진 jar 를 컨테이너에 담는, 가장 단순한 형태.
# 이 파일과 myapp.jar 를 같은 폴더에 두고 그 폴더에서 빌드한다.
#
#   docker build -t myapp:1.0 .
#   docker run -d --name myapp -p 8080:8080 -m 1g myapp:1.0
#
# 소스만 있고 jar 가 없다면 Dockerfile.multistage 쪽을 본다.

# 바닥에 깔 base 이미지. 자바 17 런타임이 들어 있는 리눅스 한 벌이다.
# -jre 는 실행 전용이라 컴파일러가 빠져 가볍다. 안에서 빌드까지 할 게 아니면 -jdk 대신 이쪽.
# 예전에 쓰던 openjdk 공식 이미지는 지금 갱신되지 않는다.
FROM eclipse-temurin:17-jre

# 빌드할 때만 쓰는 변수. 이미지 안에는 남지 않는다.
# 다른 jar 로 빌드하려면 --build-arg JAR_FILE=./other.jar
ARG JAR_FILE=./myapp.jar

# 컨테이너에서 쓸 환경 변수. docker run -e 로 덮어쓸 수 있다.
# base 이미지는 대개 UTC 라 TZ 를 안 주면 로그 시각이 9시간 어긋난다.
ENV TZ=Asia/Seoul

# 힙 크기는 여기서 고정하지 않는다. docker run -m 으로 컨테이너에 한도를 주면
# 자바 10 이상은 그 값을 읽어 알아서 잡는다. 비율만 조정하고 싶을 때:
#   ENV JAVA_OPTS="-XX:MaxRAMPercentage=75"
ENV JAVA_OPTS=""

WORKDIR /app

# 자주 바뀌는 줄일수록 아래에 둔다. 위쪽 레이어는 캐시에서 그대로 재사용된다.
COPY ${JAR_FILE} ./app.jar

# 이 컨테이너가 쓰는 포트라는 표시일 뿐, 실제로 열어주지는 않는다.
# 여는 것은 docker run -p 8080:8080 쪽이다.
EXPOSE 8080

# exec 형태(["java", "-jar", ...])가 기본이고 시그널이 바로 꽂혀서 좋지만,
# ${JAVA_OPTS} 같은 변수가 펼쳐지지 않는다. 변수를 쓰려고 sh -c 로 감쌌다.
# 이때 exec 를 빼면 셸이 1번 프로세스로 남아 docker stop 의 SIGTERM 을
# 자바에 넘기지 않는다. 그러면 10초 뒤 강제 종료된다.
ENTRYPOINT ["sh", "-c", "exec java ${JAVA_OPTS} -jar /app/app.jar"]
