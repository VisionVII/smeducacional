@echo off
echo ========================================
echo Regenerando Prisma Client...
echo ========================================
call npx prisma generate

echo.
echo ========================================
echo Criando tabela admin_themes no banco...
echo ========================================
call npx prisma db push --accept-data-loss

echo.
echo ========================================
echo CONCLUIDO! Prisma Client regenerado e schema aplicado.
echo ========================================
pause
