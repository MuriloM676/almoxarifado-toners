const request = require("supertest");
const { createApp } = require("../app");

let app, db, token;

beforeAll(() => {
  ({ app, db } = createApp({ dbPath: ":memory:", jwtSecret: "ci-test-secret" }));
});

afterAll(() => {
  db.close();
});

// ── Auth ──────────────────────────────────────────────────────
describe("POST /api/auth/login", () => {
  it("retorna 400 se faltar campos", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin" });
    expect(res.status).toBe(400);
  });

  it("retorna 401 para credenciais erradas", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin", password: "errada" });
    expect(res.status).toBe(401);
  });

  it("faz login com admin padrão e retorna token", async () => {
    const res = await request(app).post("/api/auth/login").send({ username: "admin", password: "admin123" });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.username).toBe("admin");
    token = res.body.token;
  });
});

// ── Toners: autenticação ──────────────────────────────────────
describe("GET /api/toners sem token", () => {
  it("retorna 401", async () => {
    const res = await request(app).get("/api/toners");
    expect(res.status).toBe(401);
  });
});

// ── Toners: CRUD ──────────────────────────────────────────────
describe("CRUD /api/toners", () => {
  let tonerId;

  it("lista toners (seed já inserido)", async () => {
    const res = await request(app).get("/api/toners").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("cria um novo toner", async () => {
    const res = await request(app)
      .post("/api/toners")
      .set("Authorization", `Bearer ${token}`)
      .send({ modelo: "Teste 001", impressora: "Impressora X", cor: "Preto", estoque: 5, estoqueMinimo: 2, preco: 99.9 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("id");
    tonerId = res.body.id;
  });

  it("atualiza o toner", async () => {
    const res = await request(app)
      .put(`/api/toners/${tonerId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ modelo: "Teste 001 Edit", impressora: "Impressora X", cor: "Preto", estoque: 10, estoqueMinimo: 2, preco: 99.9 });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("deleta o toner", async () => {
    const res = await request(app)
      .delete(`/api/toners/${tonerId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

// ── Saída: estoque insuficiente ───────────────────────────────
describe("POST /api/saidas", () => {
  it("retorna 400 quando estoque insuficiente", async () => {
    // Pega o primeiro toner do seed (Brother TN-1060, estoque=0)
    const toners = await request(app).get("/api/toners").set("Authorization", `Bearer ${token}`);
    const semEstoque = toners.body.find(t => t.estoque === 0);
    expect(semEstoque).toBeDefined();

    const res = await request(app)
      .post("/api/saidas")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: "S001", data: "06/03/2026", dataHora: "06/03/2026 10:00",
        tonerId: semEstoque.id, tonerModelo: semEstoque.modelo,
        setor: "Prefeitura", quantidade: 1, responsavel: "Admin", obs: ""
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/insuficiente/i);
  });
});

// ── Pedidos ───────────────────────────────────────────────────
describe("Pedidos", () => {
  const pedidoId = "PED-TEST-001";

  it("cria pedido", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: pedidoId, codigo: "P001", data: "06/03/2026",
        dataCriacao: "06/03/2026 10:00", status: "Pendente",
        total: 100, itens: [{ tonerId: 1, quantidade: 1 }]
      });
    expect(res.status).toBe(200);
  });

  it("lista pedidos", async () => {
    const res = await request(app).get("/api/pedidos").set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.some(p => p.id === pedidoId)).toBe(true);
  });

  it("atualiza status do pedido", async () => {
    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "Aprovado" });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
