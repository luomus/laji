#!/usr/bin/env bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
EXIT_CODE=0

echo "Fetching the latest laji-cli tools"
docker pull luomus/laji-cli >/dev/null 2>&1

echo "Sending bsg to crowdin"
docker run --rm --env-file ${SCRIPT_PATH}/.env.bsg -v ${SCRIPT_PATH}/../projects/bsg/i18n:/data luomus/laji-cli \
  crowdin:send:json BIRD_SOUNDS_GLOBAL \
  en:/data/en.json \
  zh-TW:/data/zh.json \
  fr:/data/fr.json \
  es-ES:/data/es.json \
  || EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
    echo "Sending failed"
    exit $EXIT_CODE
fi

echo "All done"
