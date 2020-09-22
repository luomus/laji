#!/usr/bin/env bash

SCRIPT_PATH="$( cd "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"

echo "Fetching the latest laji-cli tools"
docker pull luomus/laji-cli >/dev/null 2>&1

echo "Sending laji.fi to crowdin"
docker run --rm --env-file ${SCRIPT_PATH}/.env -v ${SCRIPT_PATH}/../src/i18n:/data luomus/laji-cli \
  crowdin:send:json LAJI /data/fi.json \
  fi:/data/fi.json  \
  en:/data/en.json \
  sv-FI:/data/sv.json

echo "Sending viranomaiset.laji.fi to crowdin"
docker run --rm --env-file ${SCRIPT_PATH}/.env -v ${SCRIPT_PATH}/../projects/vir/i18n:/data luomus/laji-cli \
  crowdin:send:json VIR /data/fi.json \
  fi:/data/fi.json  \
  en:/data/en.json \
  sv-FI:/data/sv.json

echo "All done"
