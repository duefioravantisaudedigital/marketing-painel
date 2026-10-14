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
