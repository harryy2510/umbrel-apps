# hariom Umbrel App Store

Community apps for [Umbrel](https://umbrel.com). Store id: `hariom`.

Live MCP stack is **`hariom-mcp`**. `hariom-metorial` is leftover and unused.

## Add this store on Umbrel

1. Open Umbrel → **App Store** → **Community App Stores** → **Add**.
2. Paste the Git URL of this repo (after you push it), or copy the app folder onto the box.

Until the repo is public, copy `hariom-mcp/` onto the Umbrel box under a cloned store, or run `docker compose` from that folder as in `hariom-mcp/README.md`.

## MCP Gateway (`hariom-mcp`)

Host-network MetaMCP + OpenConnector + CloudWatch `mcp-proxy` wrappers. Agents use:

```text
http://umbrel.local:12008/metamcp/<endpoint>/mcp
```

No API keys on that URL. Oomol holds provider OAuth. CloudWatch is uvx behind mcp-proxy on loopback. Read `hariom-mcp/README.md` before first start: you must copy Arcane volumes and `stack.env`, and load the linux/amd64 MetaMCP image onto **host** Docker.

This is not a public getumbrel/umbrel-apps submission. Umbrel app-data compose is overwritten on store updates; keep `stack.env` and `data/` in app-data.

## Metorial (`hariom-metorial`)

Unused leftover. Do not install it for MCP aggregation.
