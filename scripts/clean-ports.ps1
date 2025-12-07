#!/usr/bin/env pwsh
# Script para limpar processos Node.js e garantir porta 3000 livre

Write-Host "[INFO] Verificando processos Node.js..." -ForegroundColor Cyan

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "[AVISO] Encontrados $($nodeProcesses.Count) processos Node.js ativos" -ForegroundColor Yellow
    Write-Host "[ACAO] Encerrando processos..." -ForegroundColor Yellow
    
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "  [OK] Processo $($_.Id) encerrado" -ForegroundColor Green
        } catch {
            Write-Host "  [ERRO] Falha ao encerrar processo $($_.Id)" -ForegroundColor Red
        }
    }
    
    Start-Sleep -Seconds 1
} else {
    Write-Host "[OK] Nenhum processo Node.js encontrado" -ForegroundColor Green
}

# Verificar se porta 3000 esta livre
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue

if ($port3000) {
    Write-Host "[AVISO] Porta 3000 ainda ocupada!" -ForegroundColor Yellow
    $processId = $port3000.OwningProcess
    Write-Host "  [INFO] Processo ocupando: $processId" -ForegroundColor Yellow
    
    try {
        Stop-Process -Id $processId -Force
        Write-Host "[OK] Porta 3000 liberada!" -ForegroundColor Green
    } catch {
        Write-Host "[ERRO] Nao foi possivel liberar a porta 3000" -ForegroundColor Red
    }
} else {
    Write-Host "[OK] Porta 3000 esta livre!" -ForegroundColor Green
}

Write-Host ""
Write-Host "[PRONTO] Voce pode iniciar o servidor agora com: npm run dev" -ForegroundColor Cyan
