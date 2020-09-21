#!/usr/bin/env bash

echo "Getting laji.fi translations..."
docker run --rm --env-file .env -v $(pwd)/../src/i18n:/data luomus/laji-cli \
  crowdin:get:json LAJI \
  fi:/data/fi.json  \
  en:/data/en.json \
  sv-FI:/data/sv.json

echo "Getting viranomaiset.laji.fi translations..."
docker run --rm --env-file .env -v $(pwd)/../projects/vir/i18n:/data luomus/laji-cli \
  crowdin:get:json VIR \
  fi:/data/fi.json  \
  en:/data/en.json \
  sv-FI:/data/sv.json

echo "All done"
