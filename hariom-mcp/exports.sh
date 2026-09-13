# Sourced by Umbrel before compose interpolation.
# Secrets come from stack.env (copied from Arcane). Do not derive them from APP_SEED.

export APP_HARIOM_MCP_METAMCP_PORT="12008"
export APP_HARIOM_MCP_OOMOL_PORT="33000"

STACK_ENV="${APP_DATA_DIR}/stack.env"
if [ -f "${STACK_ENV}" ]; then
  set -a
  # shellcheck disable=SC1090
  . "${STACK_ENV}"
  set +a
fi

# Map the loaded amd64 tar to a non-registry name so compose build does not Head GHCR.
docker tag ghcr.io/umbrella-it-group/metamcp:latest hariom-metamcp:local >/dev/null 2>&1 || true
