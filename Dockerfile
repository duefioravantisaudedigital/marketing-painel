# 1) Build: gera os arquivos estaticos (HTML, JS, CSS) do painel
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Endereco da API fica gravado no JS no momento do build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# 2) Servidor: so os arquivos prontos, sem Node, sem codigo-fonte
FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
