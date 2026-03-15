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
│   ├── app.js           # Lógica de rotas e banco
│   ├── migrate.js       # Migração de banco
│   ├── __tests__/       # Testes automatizados (Jest/Supertest)
│   └── almoxarifado.db  # gerado automaticamente
└── frontend/
    ├── src/
    │   ├── App.jsx      # Interface completa
    │   ├── api.js       # Comunicação com backend
    │   ├── __tests__/   # Testes de componentes (Vitest)
    │   └── main.jsx
    ├── vite.config.js
    └── package.json
```

## Testes

### Backend
- Execute os testes automatizados:
```bash
cd backend
npm test
```
- Os testes cobrem autenticação, CRUD de toners, pedidos e validação de estoque.

### Frontend
- Execute os testes de componentes:
```bash
cd frontend
npm run test
```

## Endpoints da API (Backend)

| Método | Rota                | Descrição                        |
|--------|---------------------|----------------------------------|
| POST   | /api/auth/login     | Login (usuário/senha)            |
| PUT    | /api/auth/senha     | Troca de senha                   |
| GET    | /api/toners         | Lista todos os toners            |
| POST   | /api/toners         | Cria toner                       |
| PUT    | /api/toners/:id     | Atualiza toner                   |
| DELETE | /api/toners/:id     | Remove toner                     |
| GET    | /api/pedidos        | Lista pedidos                    |
| POST   | /api/pedidos        | Cria pedido                      |
| PUT    | /api/pedidos/:id    | Atualiza status do pedido        |
| GET    | /api/entradas       | Lista entradas                   |
| POST   | /api/entradas       | Registra entrada de toner        |
| GET    | /api/saidas         | Lista saídas                     |
| POST   | /api/saidas         | Registra saída de toner          |

### Exemplo de requisição (login)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"admin123"}'
```

### Exemplo de requisição (criar toner)
```bash
curl -X POST http://localhost:3001/api/toners \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"modelo":"HP 85A","impressora":"HP LaserJet P1102","cor":"Preto","estoque":3,"estoqueMinimo":2,"preco":89.90}'
```

