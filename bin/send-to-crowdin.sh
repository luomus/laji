#!/usr/bin/env bash

echo "Sending laji.fi to crowdin"
docker run --rm --env-file .env -v $(pwd)/../src/i18n:/data luomus/laji-cli \
  crowdin:send:json LAJI \
  fi:/data/fi.json  \
  en:/data/en.json \
  sv-FI:/data/sv.json

echo "Sending viranomaiset.laji.fi to crowdin"
docker run --rm --env-file .env -v $(pwd)/../projects/vir/i18n:/data luomus/laji-cli \
  crowdin:send:json VIR \
  fi:/data/fi.json  \
  en:/data/en.json \
  sv-FI:/data/sv.json

echo "All done"
