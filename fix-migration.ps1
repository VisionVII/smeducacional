# Fix Migration Script
# Remove pasta de migration corrompida e cria nova

Write-Host "🔧 Limpando migration corrompida..." -ForegroundColor Yellow

# Remove pasta problemática se existir
$migrationPath = "prisma\migrations\20251230000000_add_system_status"
if (Test-Path $migrationPath) {
    Remove-Item -Recurse -Force $migrationPath
    Write-Host "✅ Pasta corrompida removida" -ForegroundColor Green
} else {
    Write-Host "⚠️  Pasta não encontrada (já foi removida)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Criando nova migration..." -ForegroundColor Cyan
npx prisma migrate dev --name "add_system_status_for_maintenance"

Write-Host ""
Write-Host "🔄 Regenerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate

Write-Host ""
Write-Host "✅ Concluído! Agora execute: npm run build" -ForegroundColor Green
