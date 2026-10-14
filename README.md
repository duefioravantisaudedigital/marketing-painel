# marketing-painel

Painel do sistema de marketing da Due Fioravanti: filtros de pacientes, campanhas de WhatsApp e acompanhamento dos envios.

## Stack

- Vite + React + TypeScript
- React Router (navegacao)
- TanStack Query (chamadas a API, com cache)
- Tailwind CSS

## Rodar localmente

```bash
cp .env.example .env
npm install
npm run dev
```

A API (`marketing-api`) precisa estar rodando no endereco de `VITE_API_URL`.

## Build de producao

```bash
npm run build
```

Gera arquivos estaticos em `dist/`, servidos pelo Caddy na VPS.

## Deploy na VPS

O painel roda como container `marketing-painel` (build com Node, servido por um Caddy interno),
na rede `web`. O Caddy principal da VPS cuida do HTTPS e encaminha
`painel-marketing.duefioravanti-saudedigital.com.br` para ele.

```bash
cd /opt/marketing-painel && git pull && docker compose up -d --build
```

O endereco da API vai no `docker-compose.yml` (`VITE_API_URL`) e fica gravado no build.
