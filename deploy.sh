#!/bin/bash
echo ""
echo "🌿 Ethos AI — Deploy para Vercel"
echo "================================="
echo ""

# Verifica se Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado."
  echo "   Instale em: https://nodejs.org"
  exit 1
fi

echo "✓ Node.js encontrado: $(node -v)"
echo ""
echo "Iniciando deploy do Ethos AI..."
echo "(Um navegador vai abrir para você fazer login no Vercel)"
echo ""

# Vai para a pasta do projeto
cd "$(dirname "$0")"

# Faz o deploy com npx vercel (sem instalar globalmente)
npx vercel --yes 2>&1

echo ""
echo "✅ Deploy concluído! Copie a URL acima e envie para o Claude."
