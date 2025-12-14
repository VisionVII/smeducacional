#!/bin/bash
# Script para testar o fluxo de cursos do aluno

echo "🧪 Testando fluxo de cursos do aluno..."
echo "======================================="
echo ""

echo "1️⃣  Testando seed..."
npm run db:seed

echo ""
echo "2️⃣  Iniciando servidor dev..."
npm run dev &
DEV_PID=$!

sleep 10

echo ""
echo "3️⃣  Consultando dados do banco..."
npm run db:studio &

echo ""
echo "Pressione ENTER para encerrar os testes..."
read

kill $DEV_PID
