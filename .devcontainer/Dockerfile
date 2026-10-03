# 1. Imagen efímera con la versión exacta de Node que queremos
FROM node:22.14.0-bookworm-slim AS node-source

# 2. Tu imagen base de Python
FROM mcr.microsoft.com/devcontainers/python:3.12-bookworm
ENV DEBIAN_FRONTEND=noninteractive

# Extraer Node.js y npm directamente de la imagen oficial (sin apt, sin curl | bash)
COPY --from=node-source /usr/local/bin/node /usr/local/bin/node
COPY --from=node-source /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -s /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx

# Instalar pnpm globalmente y uv para Python
RUN npm install -g pnpm \
    && pip install --no-cache-dir uv