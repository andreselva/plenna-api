#!/bin/sh
set -eu

# Railway define PORT. Use 8001 como padrão local.
API_PORT="${PORT:-8001}"

# Suporte opcional a debug via env (API_INSPECT, APPT_INSPECT, EMAIL_INSPECT)
api_args=""
appt_args=""
email_args=""

if [ -n "${API_INSPECT:-}" ]; then
  if [ "${API_INSPECT_BRK:-false}" = "true" ]; then
    api_args="--inspect-brk=${API_INSPECT}"
  else
    api_args="--inspect=${API_INSPECT}"
  fi
fi

if [ -n "${APPT_INSPECT:-}" ]; then
  if [ "${APPT_INSPECT_BRK:-false}" = "true" ]; then
    appt_args="--inspect-brk=${APPT_INSPECT}"
  else
    appt_args="--inspect=${APPT_INSPECT}"
  fi
fi

if [ -n "${EMAIL_INSPECT:-}" ]; then
  if [ "${EMAIL_INSPECT_BRK:-false}" = "true" ]; then
    email_args="--inspect-brk=${EMAIL_INSPECT}"
  else
    email_args="--inspect=${EMAIL_INSPECT}"
  fi
fi

# Exporta PORT para a API
export PORT="$API_PORT"

echo ">> Starting API on PORT=$PORT"
node $api_args -r ./register-paths.js dist/main.js &
API_PID=$!

echo ">> Starting appointments worker"
node $appt_args -r ./register-paths.js dist-worker/workers/appointments/appointments.worker.js &
APPT_PID=$!

echo ">> Starting email worker"
node $email_args -r ./register-paths.js dist-worker/workers/email/email.worker.js &
EMAIL_PID=$!

term_handler() {
  echo ">> Signal received, stopping children..."
  kill -TERM "$API_PID" "$APPT_PID" "$EMAIL_PID" 2>/dev/null || true
}
trap term_handler TERM INT

any_exited() {
  for pid in "$API_PID" "$APPT_PID" "$EMAIL_PID"; do
    if ! kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  done
  return 1
}

while :; do
  if any_exited; then
    echo ">> One process exited. Stopping all..."
    kill -TERM "$API_PID" "$APPT_PID" "$EMAIL_PID" 2>/dev/null || true
    wait || true
    exit 1
  fi
  sleep 1
done
