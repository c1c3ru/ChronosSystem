#!/bin/bash
# Script chamado pelo crontab para disparar o check diário de justificativas.
# Gerado automaticamente pelo start-system.sh — não edite manualmente.

ENV_FILE="$(dirname "$0")/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[chronos-daily] .env não encontrado em $ENV_FILE" >&2
  exit 1
fi

CRON_SECRET=$(grep "^CRON_SECRET=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
APP_URL=$(grep "^NEXTAUTH_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")

if [ -z "$CRON_SECRET" ] || [ -z "$APP_URL" ]; then
  echo "[chronos-daily] CRON_SECRET ou NEXTAUTH_URL não definidos no .env" >&2
  exit 1
fi

ENDPOINT="${APP_URL}/api/cron/daily-justification-check"

HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "$ENDPOINT" 2>&1)

CURL_EXIT=$?

if [ $CURL_EXIT -ne 0 ]; then
  echo "[chronos-daily] $(date '+%Y-%m-%d %H:%M') ERRO: curl falhou (exit $CURL_EXIT) ao chamar $ENDPOINT" >&2
  exit 1
fi

if [ "$HTTP_STATUS" = "200" ]; then
  echo "[chronos-daily] $(date '+%Y-%m-%d %H:%M') OK: check diário processado (HTTP $HTTP_STATUS)"
else
  echo "[chronos-daily] $(date '+%Y-%m-%d %H:%M') AVISO: HTTP $HTTP_STATUS de $ENDPOINT" >&2
fi
