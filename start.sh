#!/bin/bash
echo "🚀 Iniciando Almoxarifado de Toners..."

# Instala dependências do backend se necessário
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Instalando dependências do backend..."
  (cd backend && npm install)
fi

# Instala dependências do frontend se necessário
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Instalando dependências do frontend..."
  (cd frontend && npm install)
fi

# Backend
cd backend
node server.js &
BACKEND_PID=$!
echo "✅ Backend rodando (PID $BACKEND_PID)"

# Frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend rodando (PID $FRONTEND_PID)"

echo ""
echo "🌐 Acesse: http://localhost:5173"
echo "   Pressione Ctrl+C para encerrar ambos."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Serviços encerrados.'" INT
wait