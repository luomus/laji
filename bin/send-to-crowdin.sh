#!/usr/bin/env bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
EXIT_CODE=0

echo "Fetching the latest laji-cli tools"
docker pull luomus/laji-cli >/dev/null 2>&1

echo "Sending laji.fi to crowdin"
docker run --rm --env-file ${SCRIPT_PATH}/.env -v ${SCRIPT_PATH}/../projects/laji/src/i18n:/data luomus/laji-cli \
  crowdin:send:json LAJI \
  fi:/data/fi.json  \
  en-GB:/data/en.json \
  sv-FI:/data/sv.json \
  || EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
    echo "Sending failed"
    exit $EXIT_CODE
fi

echo "Sending viranomaiset.laji.fi to crowdin"
docker run --rm --env-file ${SCRIPT_PATH}/.env -v ${SCRIPT_PATH}/../projects/vir/i18n:/data luomus/laji-cli \
  crowdin:send:json VIR \
  fi:/data/fi.json  \
  en-GB:/data/en.json \
  sv-FI:/data/sv.json \
  || EXIT_CODE=$?

if [[ $EXIT_CODE -ne 0 ]]; then
    echo "Sending failed"
    exit $EXIT_CODE
fi

echo "All done"
