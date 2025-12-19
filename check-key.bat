@echo off
echo.
echo ============================================================
echo   VERIFICANDO CHAVE ANON SUPABASE
echo ============================================================
echo.
findstr "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local > temp-key.txt
if errorlevel 1 (
    echo [X] Chave nao encontrada no .env.local
    del temp-key.txt 2>nul
    exit /b 1
)

echo [OK] Chave encontrada no .env.local
echo.
echo Primeiros 80 caracteres:
type temp-key.txt | findstr /R ".*"
echo.
echo.
echo ============================================================
echo   INSTRUCOES:
echo ============================================================
echo.
echo 1. Abra: https://supabase.com/dashboard/project/okxgsvalfwxxoxcfxmhc/settings/api
echo 2. Copie a chave "anon" "public" (comeca com eyJ...)
echo 3. Abra: code .env.local
echo 4. Substitua TODA a linha NEXT_PUBLIC_SUPABASE_ANON_KEY
echo 5. Salve (Ctrl+S)
echo 6. REINICIE o servidor: Ctrl+C depois npm run dev
echo.
echo A chave deve ter este formato:
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
echo (3 partes separadas por pontos)
echo.
del temp-key.txt 2>nul
pause
