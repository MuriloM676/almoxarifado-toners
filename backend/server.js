const { createApp } = require("./app");

const PORT = process.env.PORT || 3001;

if (!process.env.JWT_SECRET) {
  console.error("❌ ERRO FATAL: variável de ambiente JWT_SECRET não definida. Defina-a no arquivo .env antes de iniciar.");
  process.exit(1);
}

const { app } = createApp();

app.listen(PORT, () => {
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
