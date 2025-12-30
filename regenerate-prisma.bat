@echo off
echo ========================================
echo 🔧 Regenerando Prisma Client
echo ========================================
echo.

echo [1/5] Parando processos Node...
taskkill /F /IM node.exe /T >nul 2>&1
echo ✅ Processos Node finalizados
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Limpando cache do Prisma...
if exist "node_modules\.prisma" (
    rmdir /s /q "node_modules\.prisma" 2>nul
    echo ✅ Cache limpo
) else (
    echo ℹ️  Cache já estava limpo
)

echo.
echo [3/5] Regenerando Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Erro ao regenerar Prisma Client!
    echo Por favor, feche o VSCode e tente novamente
    pause
    exit /b 1
)
echo ✅ Prisma Client regenerado

echo.
echo [4/5] Verificando se funcionou...
node -e "try { const { PrismaClient } = require('@prisma/client'); const p = new PrismaClient(); if ('featurePurchase' in p) { console.log('✅ FeaturePurchase model detectado!'); } else { console.log('❌ FeaturePurchase model NÃO encontrado'); } p.$disconnect(); } catch(e) { console.log('❌ Erro:', e.message); }"

echo.
echo [5/5] Aplicando schema no banco...
call npx prisma db push --accept-data-loss
echo ✅ Schema aplicado

echo.
echo ========================================
echo ✅ CONCLUÍDO COM SUCESSO!
echo ========================================
echo.
echo 📝 PRÓXIMOS PASSOS:
echo    1. Feche este terminal
echo    2. Se o VSCode estiver aberto, FECHE-O (Alt+F4)
echo    3. Reabra o VSCode: code .
echo    4. Aguarde 15 segundos
echo    5. Os erros TypeScript devem desaparecer!
echo.
pause
