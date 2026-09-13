# hariom-mcp

Local Umbrel community app. Not a public App Store submission.

Host Docker on the Umbrel box. One compose, `network_mode: host`. Arcane DinD is only a source of volumes and env; stop it after the copy.

| Piece | Job | Agent sees |
| --- | --- | --- |
| OpenConnector `:33000` | Provider OAuth | never |
| MetaMCP `:12008` | Fan-in, no API keys | `http://umbrel.local:12008/metamcp/<endpoint>/mcp` |
| mcp-proxy + uvx `:8010` / `:8011` | CloudWatch stdio → Streamable HTTP | never |
| Postgres `:9433` | MetaMCP DB, loopback only | never |

Do not put `uvx` inside MetaMCP STDIO. Do not put `oct_` tokens in agentsync. Do not install `hariom-metorial` for this.

## Layout

```text
hariom-mcp/
  docker-compose.yml
  mcp-proxy.Dockerfile
  env.example          # copy to stack.env; never name it .env
  umbrel-app.yml
  exports.sh
  hooks/pre-start
```

## 1. Secrets (`stack.env`)

On the Umbrel box, dump the **running** Arcane containers. Paste values into `stack.env`. Do not generate new `BETTER_AUTH_SECRET`, `POSTGRES_PASSWORD`, or `OOMOL_CONNECT_ENCRYPTION_KEY` if you are copying volumes.

```bash
docker exec arcane_docker_1 docker -H unix:///data/docker.sock exec metamcp printenv
docker exec arcane_docker_1 docker -H unix:///data/docker.sock exec open-connector-connector-1 printenv
```

CloudWatch keys, if those wrappers already exist:

```bash
docker exec arcane_docker_1 docker -H unix:///data/docker.sock exec metamcp-cw-dev printenv
docker exec arcane_docker_1 docker -H unix:///data/docker.sock exec metamcp-cw-prod printenv
```

Copy `env.example` to `stack.env` and fill it. `DATABASE_URL` must use the same password as `POSTGRES_PASSWORD` and host `127.0.0.1:9433`.

Oomol runtime tokens (`oct_…`) stay out of `stack.env`. After start, put them on MetaMCP MCP-server `bearer_token` rows.

If an `oct_` value was pasted into chat or logs, rotate it in OpenConnector Access and update the MetaMCP rows. Same for any AWS keys that appeared in SuperGateway logs.

## 2. Load the MetaMCP image onto **host** Docker (not Arcane)

Same tar as last time. Last time `docker load` went into DinD (`arcane_docker_1` + `unix:///data/docker.sock`). This time it is the Umbrel **host** daemon. Do not `docker exec` Arcane. Do not `docker load -i /tmp/...`.

If `/home/umbrel/metamcp-umbrella.tar` is still on the box, as **root**:

```bash
cat /home/umbrel/metamcp-umbrella.tar | docker load
docker image inspect ghcr.io/umbrella-it-group/metamcp:latest --format '{{.Architecture}}'
```

Must print `amd64`. Then refresh this community store and retry Install.

If the tar is gone, rebuild on the Mac (Umbrel is x86_64; a Mac arm64 image exec-formats):

```bash
cd /tmp/metamcp-umbrella
docker build --platform linux/amd64 -t ghcr.io/umbrella-it-group/metamcp:latest .
docker save -o /tmp/metamcp-umbrella.tar ghcr.io/umbrella-it-group/metamcp:latest
scp -o IdentitiesOnly=yes -i ~/.ssh/id_gh_deploy_ed25519 /tmp/metamcp-umbrella.tar umbrel@umbrel.local:/home/umbrel/metamcp-umbrella.tar
```

Then the same `cat … | docker load` on Umbrel as root.

## 3. Copy volumes out of Arcane

Default Umbrel app-data path:

```text
/home/umbrel/umbrel/app-data/hariom-mcp
```

Create the data dirs, then copy. If you have not installed the app yet, create that tree yourself (or install the app once so `pre-start` makes the dirs, then stop it before it inits empty Postgres).

**Postgres** (volume name on DinD is `metamcp_postgres_data`):

```bash
mkdir -p /home/umbrel/umbrel/app-data/hariom-mcp/data/postgres
docker exec arcane_docker_1 docker -H unix:///data/docker.sock run --rm \
  -v metamcp_postgres_data:/from:ro alpine \
  tar -C /from -cf - . \
  | tar -C /home/umbrel/umbrel/app-data/hariom-mcp/data/postgres -xf -
```

**OpenConnector** (`/app/data`). Confirm the volume name first:

```bash
docker exec arcane_docker_1 docker -H unix:///data/docker.sock \
  inspect open-connector-connector-1 \
  --format '{{range .Mounts}}{{.Name}} {{.Source}} -> {{.Destination}}{{println}}{{end}}'
```

Then, with that volume name (often `open-connector_connector-data`):

```bash
mkdir -p /home/umbrel/umbrel/app-data/hariom-mcp/data/oomol
docker exec arcane_docker_1 docker -H unix:///data/docker.sock run --rm \
  -v open-connector_connector-data:/from:ro alpine \
  tar -C /from -cf - . \
  | tar -C /home/umbrel/umbrel/app-data/hariom-mcp/data/oomol -xf -
```

Place `stack.env` at `/home/umbrel/umbrel/app-data/hariom-mcp/stack.env`.

## 4. Start on the host daemon

From this app directory on the Umbrel box, after `stack.env` is in place:

```bash
chmod +x hooks/pre-start exports.sh
docker compose --env-file stack.env build cw-dev
docker compose --env-file stack.env up -d
```

Or install from this community store on Umbrel (store id `hariom`) once the files are on the box / in git. `hooks/pre-start` refuses to start without `stack.env`.

Do not start Arcane’s MetaMCP at the same time. Ports `12008` and `33000` and Postgres `9433` collide. After this stack is healthy, power Arcane down yourself.

## 5. Point MetaMCP at loopback

Inside host network, backends are:

- Oomol: `http://127.0.0.1:33000/mcp` + bearer `oct_…` on each STREAMABLE_HTTP server row
- CloudWatch dev: `http://127.0.0.1:8010/mcp`
- CloudWatch prod: `http://127.0.0.1:8011/mcp`

If rows still say `http://192.168.1.200:33000/mcp`, update URL only. Do not delete the five Oomol servers (`5star`, `hariom-s2510`, `hariom0sharma`, `speak-to-freedom`, `my-trainer-connect`) or the `5star` endpoint.

UI bearer-token save has failed with a generic tRPC error. Bypass after you rotate the token (do not paste it into chat):

```bash
docker exec -it metamcp-pg psql -U metamcp_user -d metamcp_db -c \
  "UPDATE mcp_servers SET url = replace(url, 'http://192.168.1.200:33000/mcp', 'http://127.0.0.1:33000/mcp') WHERE url LIKE '%192.168.1.200:33000%';"
```

Then set `bearer_token` per row from a value you keep local.

## 6. Agents

agentsync / Grok:

```text
http://umbrel.local:12008/metamcp/5star/mcp
```

No `Authorization` header. `ALLOW_UNAUTHENTICATED_ENDPOINTS=true` is required. Open MetaMCP UI only at `APP_URL` (`http://umbrel.local:12008`) because CORS is pinned to that origin.

## Checks (after you start it)

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:12008/health
curl -sS http://127.0.0.1:33000/health
curl -sS -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1:8011/mcp \
  -H 'content-type: application/json' \
  -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-11-25","capabilities":{},"clientInfo":{"name":"check","version":"0"}}}'
```

Oomol `/mcp` without a bearer returns `401` `Username/Password Authentication Failed`. That is the runtime token gate, not MetaMCP OAuth.
