#!/bin/bash

# PHASE 2.4 - Instalação Automatizada (Multiplataforma)
# VisionVII 3.0 Enterprise Governance
# Funciona em: Windows (Git Bash), macOS, Linux

set -e

echo "========================================"
echo "PHASE 2.4 - Instalação Automatizada"
echo "VisionVII 3.0 Enterprise Governance"
echo "========================================"
echo ""

echo "[1/4] Instalando dependências..."
echo ""
npm install sharp @supabase/supabase-js react-dropzone sonner
if [ $? -ne 0 ]; then
    echo "ERRO: Falha na instalação das dependências"
    exit 1
fi
echo ""

echo "[2/4] Executando migração do Prisma..."
echo ""
npx prisma migrate dev --name add_image_models
if [ $? -ne 0 ]; then
    echo "ERRO: Falha na migração do banco"
    exit 1
fi
echo ""

echo "[3/4] Gerando Prisma Client..."
echo ""
npx prisma generate
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao gerar Prisma Client"
    exit 1
fi
echo ""

echo "[4/4] Verificando instalação..."
echo ""
node check-phase-2-setup.js
if [ $? -ne 0 ]; then
    echo "ERRO: Verificação falhou"
    exit 1
fi
echo ""

echo "========================================"
echo "INSTALAÇÃO CONCLUÍDA!"
echo "========================================"
echo ""
echo "Próximos passos:"
echo "1. Verifique os buckets no Supabase Dashboard"
echo "2. Execute: npm run dev"
echo "3. Acesse: http://localhost:3000/admin"
echo "4. Teste o upload de imagens"
echo ""
