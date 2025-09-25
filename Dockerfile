# --------- Stage 1: Build ---------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build da API (Nest -> ./dist)
RUN npm run build

# Build dos workers (tsconfig separado -> ./dist-worker)
RUN npx tsc -p tsconfig.worker.json

# --------- Stage 2: Runtime ---------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Utilitários mínimos, init e conversão CRLF -> LF
RUN apk add --no-cache tzdata dumb-init dos2unix

# Copia artefatos e runtime
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-worker ./dist-worker
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./

# Arquivos de suporte
COPY register-paths.js ./register-paths.js
COPY entrypoint.sh ./entrypoint.sh
# Converte CRLF -> LF e garante executável
RUN dos2unix /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# (Opcional) tsconfigs para diagnósticos
COPY tsconfig.json tsconfig.json
COPY tsconfig.build.json tsconfig.build.json
COPY tsconfig.worker.json tsconfig.worker.json

# Portas expostas
EXPOSE 8001 9229 9230 9231

# Executa via /bin/sh explicitamente (evita depender de shebang)
CMD ["dumb-init", "--", "/bin/sh", "/app/entrypoint.sh"]
