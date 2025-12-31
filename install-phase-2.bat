@echo off
echo ========================================
echo PHASE 2.4 - Instalacao Automatizada
echo VisionVII 3.0 Enterprise Governance
echo ========================================
echo.

echo [1/4] Instalando dependencias...
echo.
call npm install sharp @supabase/supabase-js react-dropzone sonner
if %errorlevel% neq 0 (
    echo ERRO: Falha na instalacao das dependencias
    pause
    exit /b 1
)
echo.

echo [2/4] Executando migracao do Prisma...
echo.
call npx prisma migrate dev --name add_image_models
if %errorlevel% neq 0 (
    echo ERRO: Falha na migracao do banco
    pause
    exit /b 1
)
echo.

echo [3/4] Gerando Prisma Client...
echo.
call npx prisma generate
if %errorlevel% neq 0 (
    echo ERRO: Falha ao gerar Prisma Client
    pause
    exit /b 1
)
echo.

echo [4/4] Verificando instalacao...
echo.
node check-phase-2-setup.js
echo.

echo ========================================
echo INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo Proximos passos:
echo 1. Verifique os buckets no Supabase Dashboard
echo 2. Execute: npm run dev
echo 3. Acesse: http://localhost:3000/admin
echo 4. Teste o upload de imagens
echo.
pause
