#!/usr/bin/env pwsh
# Script para remover BOM (Byte Order Mark) de arquivos JSON

Write-Host "[INFO] Procurando arquivos JSON com BOM..." -ForegroundColor Cyan

$jsonFiles = Get-ChildItem -Path . -Filter *.json -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.next\\|\\\dist\\' }

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$fixedCount = 0

foreach ($file in $jsonFiles) {
    try {
        # Ler conteúdo
        $content = [System.IO.File]::ReadAllText($file.FullName)
        
        # Verificar se tem BOM (começa com caractere invisível)
        if ($content[0] -eq [char]0xFEFF) {
            Write-Host "[AVISO] BOM encontrado: $($file.FullName)" -ForegroundColor Yellow
            
            # Remover BOM e salvar
            $content = $content.TrimStart([char]0xFEFF)
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            
            Write-Host "  [OK] BOM removido!" -ForegroundColor Green
            $fixedCount++
        }
    } catch {
        Write-Host "[ERRO] Falha ao processar: $($file.FullName)" -ForegroundColor Red
        Write-Host "  Erro: $_" -ForegroundColor Red
    }
}

Write-Host ""
if ($fixedCount -gt 0) {
    Write-Host "[CONCLUIDO] $fixedCount arquivo(s) corrigido(s)!" -ForegroundColor Green
} else {
    Write-Host "[OK] Nenhum arquivo com BOM encontrado!" -ForegroundColor Green
}

Write-Host "[INFO] Verificando package.json especificamente..." -ForegroundColor Cyan
$packageJson = Get-Content package.json -First 1 -Encoding Byte
if ($packageJson[0] -eq 0x7B) {
    Write-Host "[OK] package.json esta correto (comeca com '{' = 0x7B)" -ForegroundColor Green
} else {
    Write-Host "[AVISO] package.json pode ter problema! Primeiro byte: 0x$($packageJson[0].ToString('X2'))" -ForegroundColor Yellow
}
