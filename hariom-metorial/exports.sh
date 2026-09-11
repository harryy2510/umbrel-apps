# MCP + API ports for other Umbrel apps and LAN agents.
# Umbrel sources this when starting the app.

# All HTTP surfaces are on the Umbrel app port (3300) via Caddy.
export APP_METORIAL_MCP_PORT="3300"
export APP_METORIAL_API_PORT="3300"

# 64 hex chars from Umbrel seed; used as ENCRYPTION_SECRET / ticket secrets.
export APP_METORIAL_SECRET="$(printf '%s' "${APP_SEED}" | sha256sum | awk '{print $1}')"
