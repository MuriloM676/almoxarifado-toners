const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = "8h";

if (!JWT_SECRET) {
  console.error("❌ ERRO FATAL: variável de ambiente JWT_SECRET não definida. Defina-a no arquivo .env antes de iniciar.");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

const db = new Database(path.join(__dirname, "data", "almoxarifado.db"));

// ── Criar tabelas ──────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    nome TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS toners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    modelo TEXT NOT NULL,
    impressora TEXT NOT NULL,
    cor TEXT DEFAULT 'Preto',
    estoque INTEGER DEFAULT 0,
    estoqueMinimo INTEGER DEFAULT 2,
    preco REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    codigo TEXT,
    data TEXT,
    dataCriacao TEXT,
    status TEXT DEFAULT 'Pendente',
    total REAL,
    itens TEXT
  );

  CREATE TABLE IF NOT EXISTS entradas (
    id TEXT PRIMARY KEY,
    data TEXT,
    dataHora TEXT,
    tonerId INTEGER,
    tonerModelo TEXT,
    quantidade INTEGER,
    fornecedor TEXT,
    nf TEXT,
    obs TEXT
  );

  CREATE TABLE IF NOT EXISTS saidas (
    id TEXT PRIMARY KEY,
    data TEXT,
    dataHora TEXT,
    tonerId INTEGER,
    tonerModelo TEXT,
    setor TEXT,
    quantidade INTEGER,
    responsavel TEXT,
    obs TEXT
  );
`);

// ── Seed: usuário admin padrão ────────────────────────────────
if (db.prepare("SELECT COUNT(*) as c FROM users").get().c === 0) {
  const hash = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password, nome) VALUES (?,?,?)").run("admin", hash, "Administrador");
  console.log("✅ Usuário admin criado (senha: admin123)");
}

// ── Seed inicial se banco estiver vazio ────────────────────────
const count = db.prepare("SELECT COUNT(*) as c FROM toners").get();
if (count.c === 0) {
  const insert = db.prepare("INSERT INTO toners (modelo,impressora,cor,estoque,estoqueMinimo,preco) VALUES (?,?,?,?,?,?)");
  [
    ["HP 85A (CE285A)",    "HP LaserJet P1102",       "Preto", 3, 5,  89.90],
    ["HP 12A (Q2612A)",    "HP LaserJet 1010/1020",   "Preto", 7, 4,  79.50],
    ["Samsung MLT-D101S",  "Samsung ML-2160",          "Preto", 2, 3,  95.00],
    ["Brother TN-1060",    "Brother HL-1202",          "Preto", 0, 2,  65.00],
    ["HP CF280A (80A)",    "HP LaserJet Pro 400",      "Preto", 5, 3, 120.00],
    ["Kyocera TK-1175",    "Kyocera M2040dn",          "Preto", 1, 4, 145.00],
  ].forEach(r => insert.run(...r));
}

// ── Rota pública: Login ───────────────────────────────────────
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Usuário e senha obrigatórios" });

  const user = db.prepare("SELECT * FROM users WHERE username=?").get(username);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: "Usuário ou senha inválidos" });

  const token = jwt.sign({ id: user.id, username: user.username, nome: user.nome }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, username: user.username, nome: user.nome } });
});

// ── Middleware de autenticação ─────────────────────────────────
const auth = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header || !header.startsWith("Bearer "))
    return res.status(401).json({ error: "Não autenticado" });
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

// Aplica autenticação em todas as rotas /api/* a partir daqui
app.use("/api", auth);

// ── Rota: trocar senha ─────────────────────────────────────────
app.put("/api/auth/senha", (req, res) => {
  const { senhaAtual, novaSenha } = req.body;
  if (!senhaAtual || !novaSenha || novaSenha.length < 6)
    return res.status(400).json({ error: "Preencha os campos. Nova senha mínimo 6 caracteres." });
  const user = db.prepare("SELECT * FROM users WHERE id=?").get(req.user.id);
  if (!bcrypt.compareSync(senhaAtual, user.password))
    return res.status(401).json({ error: "Senha atual incorreta" });
  db.prepare("UPDATE users SET password=? WHERE id=?").run(bcrypt.hashSync(novaSenha, 10), req.user.id);
  res.json({ ok: true });
});

// ── Rotas: Toners ──────────────────────────────────────────────
app.get("/api/toners", (req, res) => {
  res.json(db.prepare("SELECT * FROM toners").all());
});

app.post("/api/toners", (req, res) => {
  const { modelo, impressora, cor, estoque, estoqueMinimo, preco } = req.body;
  const r = db.prepare(
    "INSERT INTO toners (modelo,impressora,cor,estoque,estoqueMinimo,preco) VALUES (?,?,?,?,?,?)"
  ).run(modelo, impressora, cor, estoque, estoqueMinimo, preco);
  res.json({ id: r.lastInsertRowid, ...req.body });
});

app.put("/api/toners/:id", (req, res) => {
  const { modelo, impressora, cor, estoque, estoqueMinimo, preco } = req.body;
  db.prepare(
    "UPDATE toners SET modelo=?,impressora=?,cor=?,estoque=?,estoqueMinimo=?,preco=? WHERE id=?"
  ).run(modelo, impressora, cor, estoque, estoqueMinimo, preco, req.params.id);
  res.json({ ok: true });
});

app.delete("/api/toners/:id", (req, res) => {
  db.prepare("DELETE FROM toners WHERE id=?").run(req.params.id);
  res.json({ ok: true });
});

// ── Rotas: Pedidos ─────────────────────────────────────────────
app.get("/api/pedidos", (req, res) => {
  const pedidos = db.prepare("SELECT * FROM pedidos").all();
  res.json(pedidos.map(p => ({ ...p, itens: JSON.parse(p.itens) })));
});

app.post("/api/pedidos", (req, res) => {
  const p = req.body;
  db.prepare("INSERT INTO pedidos VALUES (?,?,?,?,?,?,?)").run(
    p.id, p.codigo, p.data, p.dataCriacao, p.status, p.total, JSON.stringify(p.itens)
  );
  res.json(p);
});

app.put("/api/pedidos/:id", (req, res) => {
  db.prepare("UPDATE pedidos SET status=? WHERE id=?").run(req.body.status, req.params.id);
  res.json({ ok: true });
});

// ── Rotas: Entradas ────────────────────────────────────────────
app.get("/api/entradas", (req, res) => {
  res.json(db.prepare("SELECT * FROM entradas").all());
});

app.post("/api/entradas", (req, res) => {
  const e = req.body;
  db.prepare("INSERT INTO entradas VALUES (?,?,?,?,?,?,?,?,?)").run(
    e.id, e.data, e.dataHora, e.tonerId, e.tonerModelo,
    e.quantidade, e.fornecedor, e.nf, e.obs
  );
  db.prepare("UPDATE toners SET estoque = estoque + ? WHERE id=?").run(e.quantidade, e.tonerId);
  res.json(e);
});

// ── Rotas: Saídas ──────────────────────────────────────────────
app.get("/api/saidas", (req, res) => {
  res.json(db.prepare("SELECT * FROM saidas").all());
});

app.post("/api/saidas", (req, res) => {
  const s = req.body;
  const toner = db.prepare("SELECT estoque FROM toners WHERE id=?").get(s.tonerId);
  if (!toner || toner.estoque < s.quantidade) {
    return res.status(400).json({ error: "Estoque insuficiente" });
  }
  db.prepare("INSERT INTO saidas VALUES (?,?,?,?,?,?,?,?,?)").run(
    s.id, s.data, s.dataHora, s.tonerId, s.tonerModelo,
    s.setor, s.quantidade, s.responsavel, s.obs
  );
  db.prepare("UPDATE toners SET estoque = estoque - ? WHERE id=?").run(s.quantidade, s.tonerId);
  res.json(s);
});

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
