/**
 * migrate.js
 * Importa toners (estoque), entradas e saídas do dump MySQL (tonner.sql)
 * para o banco SQLite atual (almoxarifado.db).
 *
 * Uso: node migrate.js
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const { randomUUID } = require("crypto");

const SQL_FILE = path.join(__dirname, "data", "tonner.sql");
const DB_FILE  = path.join(__dirname, "data", "almoxarifado.db");

console.log("📂 Lendo arquivo SQL...");
const sqlContent = fs.readFileSync(SQL_FILE, "utf8");

// ── Parser de VALUES do MySQL ────────────────────────────────────────────────
// Suporta strings com '', \', \\, \n, \r dentro de aspas simples, NULL e números.
function parseInsertValues(valuesStr) {
  const rows = [];
  let i = 0;
  const n = valuesStr.length;

  while (i < n) {
    // Avança até o próximo '('
    while (i < n && valuesStr[i] !== "(") i++;
    if (i >= n) break;
    i++; // pula '('

    const row = [];
    while (i < n && valuesStr[i] !== ")") {
      if (valuesStr[i] === "'") {
        // Valor string
        i++;
        let str = "";
        while (i < n) {
          if (valuesStr[i] === "\\" && i + 1 < n) {
            // Escape MySQL: \', \\, \n, \r, etc.
            const next = valuesStr[i + 1];
            if (next === "'")  { str += "'";  i += 2; }
            else if (next === "\\") { str += "\\"; i += 2; }
            else if (next === "n")  { str += "\n"; i += 2; }
            else if (next === "r")  { str += "\r"; i += 2; }
            else { str += valuesStr[i]; i++; }
          } else if (valuesStr[i] === "'" && valuesStr[i + 1] === "'") {
            // Aspas duplas escapadas ''
            str += "'"; i += 2;
          } else if (valuesStr[i] === "'") {
            i++; // fecha string
            break;
          } else {
            str += valuesStr[i++];
          }
        }
        row.push(str);
      } else if (valuesStr.slice(i, i + 4) === "NULL") {
        row.push(null); i += 4;
      } else {
        // Número ou outro token
        let tok = "";
        while (i < n && valuesStr[i] !== "," && valuesStr[i] !== ")") {
          tok += valuesStr[i++];
        }
        const num = Number(tok.trim());
        row.push(isNaN(num) ? tok.trim() : num);
      }
      if (i < n && valuesStr[i] === ",") i++; // vírgula entre valores
    }
    if (i < n) i++; // pula ')'
    rows.push(row);
    if (i < n && valuesStr[i] === ",") i++; // vírgula entre tuplas
  }
  return rows;
}

function extractTableRows(tableName) {
  // Captura: INSERT INTO `tabela` VALUES (...);
  const re = new RegExp(
    `INSERT INTO \`${tableName}\` VALUES ([\\s\\S]+?);`,
    "g"
  );
  const allRows = [];
  let m;
  while ((m = re.exec(sqlContent)) !== null) {
    allRows.push(...parseInsertValues(m[1]));
  }
  return allRows;
}

// ── Migração ─────────────────────────────────────────────────────────────────
const db = new Database(DB_FILE);

db.exec("BEGIN");
try {
  console.log("🗑️  Limpando dados anteriores (toners, entradas, saídas)...");
  db.exec("DELETE FROM saidas");
  db.exec("DELETE FROM entradas");
  db.exec("DELETE FROM toners");

  // ── 1. estoque → toners ────────────────────────────────────────────────────
  // Colunas OLD: (id_produto, produto, categoria, quantidade, minimo, ideal)
  console.log("\n📦 Importando toners (estoque)...");
  const estoqueRows = extractTableRows("estoque");

  const insertToner = db.prepare(
    "INSERT INTO toners (modelo, impressora, cor, estoque, estoqueMinimo, preco) VALUES (?, ?, ?, ?, ?, ?)"
  );

  // Mapa: chave normalizada → id no SQLite
  const tonerByChave = {};

  for (const [, produto, , quantidade, minimo] of estoqueRows) {
    const modelo = produto.trim();
    const r = insertToner.run(modelo, "", "Preto", quantidade ?? 0, minimo ?? 2, 0);
    const chave = modelo.replace(/\s+/g, "").toUpperCase();
    tonerByChave[chave] = r.lastInsertRowid;
  }
  console.log(`   ✅ ${estoqueRows.length} toners importados`);

  // Helper: encontra tonerId ou cria novo toner se não existir
  function findOrCreateToner(produto) {
    const modelo = produto.trim();
    const chave = modelo.replace(/\s+/g, "").toUpperCase();
    if (tonerByChave[chave]) {
      return { id: tonerByChave[chave], modelo };
    }
    // Cria toner ausente do estoque
    const r = insertToner.run(modelo, "", "Preto", 0, 1, 0);
    tonerByChave[chave] = r.lastInsertRowid;
    console.log(`   ➕ Toner criado (ausente do estoque): ${modelo}`);
    return { id: r.lastInsertRowid, modelo };
  }

  // ── 2. entrada → entradas ──────────────────────────────────────────────────
  // Colunas OLD: (id, produto, categoria, descricao, quantidade, data_entrada, hora_entrada)
  console.log("\n📥 Importando entradas...");
  const entradaRows = extractTableRows("entrada");

  const insertEntrada = db.prepare(
    "INSERT INTO entradas (id, data, dataHora, tonerId, tonerModelo, quantidade, fornecedor, nf, obs) VALUES (?,?,?,?,?,?,?,?,?)"
  );

  for (const [, produto, , descricao, quantidade, data_entrada, hora_entrada] of entradaRows) {
    const { id: tonerId, modelo } = findOrCreateToner(produto);
    const dataHora = `${data_entrada}T${hora_entrada}`;
    insertEntrada.run(
      randomUUID(),
      data_entrada,
      dataHora,
      tonerId,
      modelo,
      quantidade,
      "",
      "",
      (descricao ?? "").trim()
    );
  }
  console.log(`   ✅ ${entradaRows.length} entradas importadas`);

  // ── 3. saida → saidas ──────────────────────────────────────────────────────
  // Colunas OLD: (id, produto, categoria, descricao, quantidade, data_saida, hora_saida)
  console.log("\n📤 Importando saídas...");
  const saidaRows = extractTableRows("saida");

  const insertSaida = db.prepare(
    "INSERT INTO saidas (id, data, dataHora, tonerId, tonerModelo, setor, quantidade, responsavel, obs) VALUES (?,?,?,?,?,?,?,?,?)"
  );

  for (const [, produto, , descricao, quantidade, data_saida, hora_saida] of saidaRows) {
    const { id: tonerId, modelo } = findOrCreateToner(produto);
    const dataHora = `${data_saida}T${hora_saida}`;
    insertSaida.run(
      randomUUID(),
      data_saida,
      dataHora,
      tonerId,
      modelo,
      (descricao ?? "").trim(),
      quantidade,
      "",
      ""
    );
  }
  console.log(`   ✅ ${saidaRows.length} saídas importadas`);

  db.exec("COMMIT");
  console.log("\n✨ Migração concluída com sucesso!");
  console.log(`   Toners : ${estoqueRows.length}`);
  console.log(`   Entradas: ${entradaRows.length}`);
  console.log(`   Saídas  : ${saidaRows.length}`);
} catch (err) {
  db.exec("ROLLBACK");
  console.error("\n❌ Erro na migração — rollback realizado:", err);
  process.exit(1);
}
