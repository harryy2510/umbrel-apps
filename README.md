# hariom Umbrel App Store

Community apps for [Umbrel](https://umbrel.com). First app: **Metorial** (self-hosted MCP + OAuth + marketplace).

## Add this store on Umbrel

1. Open Umbrel → **App Store** → **Community App Stores** → **Add**.
2. Paste the Git URL of this repo (after you push it):

   ```text
   https://github.com/<you>/umbrel-apps
   ```

3. Install **Metorial**.

Until the repo is public, copy `hariom-metorial/` onto the Umbrel box under a cloned store, or push to GitHub first. Umbrel only adds stores by git URL.

## Metorial (`hariom-metorial`)

Self-hosted [Metorial](https://github.com/metorial/metorial-platform): OAuth, MCP gateway, in-app marketplace for custom MCP servers.

This is **not** the official Umbrel package. Upstream self-host is `run.sh` (Bun-built dashboard on the host + Docker backend). This app wraps the published GHCR backend images for umbrelOS.

### Hardware

| | Minimum | Comfortable |
|---|---|---|
| RAM | 8 GB | 16 GB |
| Disk | 20 GB SSD | 40 GB+ |
| CPU | x86_64 or aarch64 | x86_64 NUC / mini PC |

Raspberry Pi 4/5 with 8 GB will be tight (OpenSearch heap is 512 MB plus Postgres, Mongo, Redis, Silo, etcd, Meilisearch, API, engine). Prefer an x86 Umbrel.

Object storage is **[Silo](https://github.com/pgsty/silo)** (`pgsty/silo:RELEASE.2026-09-03T13-18-01Z`), a maintained MinIO fork. Same S3 API, `MINIO_*` env, and on-disk format. Compose service name stays `minio` so Metorial still talks to `minio:9000`.

### What you get after install

| Surface | Where | Auth |
|---|---|---|
| Dashboard (Umbrel tile) | Umbrel app proxy | Umbrel login |
| MCP (agents) | `http://<umbrel-host>:4311` | none (LAN). Point Claude/Codex/Grok/Droid here |
| Marketplace API | `http://<umbrel-host>:4312` | Metorial |
| OAuth callbacks | `http://<umbrel-host>:4313` | Metorial |

Set `HOST` from Umbrel (`DEVICE_DOMAIN_NAME`, usually `umbrel.local`). Agents on your LAN use that hostname.

### First boot

1. Open the app tile. If you see the **status page**, the backend is up; the official dashboard image is not published (see below).
2. Wait 1–2 minutes for Postgres + OpenSearch.
3. Check MCP: `curl -sS http://umbrel.local:4311/ping` (path may be `/` depending on image).
4. Create the first Metorial org in the dashboard when it is available, or via the Core API on port `4310`.

### Dashboard gap (upstream)

Official `self-hosting/run.sh` **builds** the React dashboard with Bun and serves it with a host Node process. There is no `ghcr.io/metorial/dashboard` image.

Until that exists:

```bash
# On a machine with Bun + Node, not on Umbrel:
git clone https://github.com/metorial/metorial-platform.git
cd metorial-platform/self-hosting
./run.sh --host umbrel.local --secret dummy --skip-backend --skip-serve
# Copy output/dashboard onto the Umbrel app data volume:
#   /home/umbrel/umbrel/app-data/hariom-metorial/data/dashboard
```

Then restart the Metorial app. The `dashboard` service serves that folder.

### Engine gap (upstream)

Published `self-hosting/docker-compose.yml` sets `ENGINE_MANAGER_ADDRESSES=engine:50050` but **does not define** an `engine` service. This package adds:

```text
ghcr.io/metorial/metorial-mcp-engine-unified:dev
```

If that image 404s on pull, custom/managed MCP sessions will fail. Remote HTTP custom servers may still register. Check:

```bash
docker pull ghcr.io/metorial/metorial-mcp-engine-unified:dev
docker pull ghcr.io/metorial/metorial-api:dev
```

Images are **`:dev`**. Pin SHAs before treating this as production.

### Custom marketplace (Metorial, not Umbrel)

After the API is healthy:

1. Create org → project → instance in Metorial.
2. **Custom servers → Remote** for public/LAN HTTP MCPs:
   - Context7: `https://mcp.context7.com/mcp`
   - Cloudflare: `https://mcp.cloudflare.com/mcp` (API token as bearer)
   - Anything already on Umbrel as HTTP (MetaMCP, OpenConnector) using the **Docker network hostname**, not `umbrel.local` from inside the compose network. From Metorial containers use `http://<other-app-container>:port/mcp` or the Umbrel app export IP.
3. **Publish listing** (`isPublic`) so it appears in this instance’s marketplace.
4. CloudWatch `uvx` stdio: wrap as streamable HTTP first, then add as Remote. Metorial will not spawn `uvx` on the host.

Do not point Custom MCP at `http://umbrel.local:...` from inside Metorial’s own compose network; that hairpins. Use the sibling container name or the Umbrel `10.21.x.x` app IP from `exports.sh` of the other app.

### Agent config (two-MCP rule)

```text
rize     — local, this Mac
metorial — http://umbrel.local:4311   # OAuth apps + custom MCPs
```

### Secrets

`ENCRYPTION_SECRET` / ticket secrets come from Umbrel `APP_SEED` (see `exports.sh`). Do not commit them. Default DB passwords in compose are for the isolated app network; they are not exposed on the host.

### Stop / data

Umbrel **Uninstall** removes containers. Data stays under `app-data/hariom-metorial/data/` until you delete that folder.
