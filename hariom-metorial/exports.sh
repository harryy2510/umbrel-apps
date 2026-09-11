# MCP + API ports for other Umbrel apps and LAN agents.
# Umbrel sources this when starting the app.

export APP_METORIAL_MCP_PORT="4311"
export APP_METORIAL_API_PORT="4310"
export APP_METORIAL_MARKETPLACE_PORT="4312"
export APP_METORIAL_OAUTH_PORT="4313"

# 64 hex chars from Umbrel seed; used as ENCRYPTION_SECRET / ticket secrets.
export APP_METORIAL_SECRET="$(printf '%s' "${APP_SEED}" | sha256sum | awk '{print $1}')"
