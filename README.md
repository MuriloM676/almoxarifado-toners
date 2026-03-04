# 🖨️ Almoxarifado · Gestão de Toners

Sistema web completo para gestão de toners de impressora.

## Funcionalidades

- **Dashboard** — visão geral com alertas de estoque crítico
- **Estoque** — cadastro, edição e controle de toners
- **Pedidos** — geração automática por estoque baixo, aprovação e recebimento
- **Entrada** — registro de recebimento com fornecedor e nota fiscal
- **Saída por Setor** — entrega de toners com gráfico de consumo por setor

## Pré-requisitos

- Node.js 18+
- npm 9+

## Como rodar

### 1. Backend (porta 3001)
```bash
cd backend
npm install
node server.js
```

### 2. Frontend (porta 5173)
```bash
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:5173

## Estrutura
```
almoxarifado-toners/
├── backend/
│   ├── server.js        # API Express + SQLite
│   ├── package.json
│   └── almoxarifado.db  # gerado automaticamente
└── frontend/
    ├── src/
    │   ├── App.jsx      # Interface completa
    │   ├── api.js       # Comunicação com backend
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```
