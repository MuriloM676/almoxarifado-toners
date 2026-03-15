const { createApp } = require("./app");

const PORT = process.env.PORT || 3001;

// Verifica se a variável de ambiente JWT_SECRET está definida
if (!process.env.JWT_SECRET) {
  // Mensagem de erro clara para o usuário
  console.error("❌ ERRO FATAL: variável de ambiente JWT_SECRET não definida. Defina-a no arquivo .env antes de iniciar.");
  process.exit(1);
}

// Cria o app Express e inicia o servidor
const { app } = createApp();

app.listen(PORT, () => {
  // Log de inicialização
  console.log(`✅ API rodando em http://localhost:${PORT}`);
});
