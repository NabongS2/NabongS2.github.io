#!/bin/bash
#
# 빌드한 이미지를 컨테이너로 띄운다.
#
#   bash docker_run.sh          # myapp:1.0
#   bash docker_run.sh 1.1      # myapp:1.1
#
# 포트와 볼륨을 매번 손으로 치지 않으려고 스크립트에 묻어 둔다.
# 경로와 포트는 각자 환경에 맞게 고쳐 쓴다.

set -euo pipefail

NAME=myapp
VERSION="${1:-1.0}"
IMAGE="${NAME}:${VERSION}"
APP_HOME="/opt/${NAME}"
PORT=8080

# 띄우기 전에 이미지가 있는지부터 본다. 없는데 run 하면
# 도커가 레지스트리에서 받아오려다 한참 뒤에 실패한다.
if ! docker image inspect "${IMAGE}" >/dev/null 2>&1; then
  echo "이미지가 없다: ${IMAGE}" >&2
  echo "docker build -t ${IMAGE} . 먼저 실행한다." >&2
  exit 1
fi

# 같은 이름이 남아 있으면 먼저 치운다. 멈춘 것도 이름을 잡고 있어서
# ps -a 로 찾아야 한다.
if [ -n "$(docker ps -aq -f "name=^/${NAME}$")" ]; then
  echo "쓰던 컨테이너를 치운다: ${NAME}"
  docker stop "${NAME}" >/dev/null 2>&1 || true
  docker rm   "${NAME}" >/dev/null
fi

# 로그와 설정은 호스트 폴더에 남긴다. 컨테이너를 갈아 끼워도 살아남는다.
mkdir -p "${APP_HOME}/log" "${APP_HOME}/config"

docker run -d \
  --name "${NAME}" \
  --restart unless-stopped \
  -p "${PORT}:8080" \
  -m 1g \
  -e TZ=Asia/Seoul \
  -e SPRING_PROFILES_ACTIVE=prod \
  -v "${APP_HOME}/log:/app/log" \
  -v "${APP_HOME}/config:/app/config" \
  "${IMAGE}"

echo
docker ps -f "name=${NAME}"
echo
echo "로그: docker logs -f -n 100 ${NAME}"
