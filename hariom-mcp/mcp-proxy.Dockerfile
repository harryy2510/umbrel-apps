# ghcr.io/sparfenyuk/mcp-proxy does not ship uv/uvx.
# Copy the official uv binaries; uvx then fetches CloudWatch MCP into the cache volume.
FROM ghcr.io/sparfenyuk/mcp-proxy:latest
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/
ENV PATH="/usr/local/bin:$PATH"
ENTRYPOINT ["catatonit", "--", "mcp-proxy"]
