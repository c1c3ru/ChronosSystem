#!/bin/bash
# Script chamado pelo crontab para disparar o cron de notificações de ponto.
# Gerado automaticamente pelo start-system.sh — não edite manualmente.

ENV_FILE="$(dirname "$0")/../.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "[chronos-cron] .env não encontrado em $ENV_FILE" >&2
  exit 1
fi

CRON_SECRET=$(grep "^CRON_SECRET=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")
APP_URL=$(grep "^NEXTAUTH_URL=" "$ENV_FILE" | cut -d= -f2- | tr -d '"' | tr -d "'")

if [ -z "$CRON_SECRET" ] || [ -z "$APP_URL" ]; then
  echo "[chronos-cron] CRON_SECRET ou NEXTAUTH_URL não definidos no .env" >&2
  exit 1
fi

ENDPOINT="${APP_URL}/api/notifications/cron"

HTTP_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "$ENDPOINT" 2>&1)

CURL_EXIT=$?

if [ $CURL_EXIT -ne 0 ]; then
  echo "[chronos-cron] $(date '+%Y-%m-%d %H:%M') ERRO: curl falhou (exit $CURL_EXIT) ao chamar $ENDPOINT" >&2
  exit 1
fi

if [ "$HTTP_STATUS" = "200" ]; then
  echo "[chronos-cron] $(date '+%Y-%m-%d %H:%M') OK: notificações processadas (HTTP $HTTP_STATUS)"
else
  echo "[chronos-cron] $(date '+%Y-%m-%d %H:%M') AVISO: HTTP $HTTP_STATUS de $ENDPOINT" >&2
fi
