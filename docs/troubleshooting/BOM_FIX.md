# 🔧 Fix: BOM (Byte Order Mark) no package.json

## 🐛 **Problema**

```
Error parsing package.json file
> 1 | ﻿{
    | ^
package.json is not parseable: invalid JSON: expected value at line 1 column 1
```

## 🎯 **Causa**

O arquivo `package.json` foi salvo com **BOM (Byte Order Mark)** - bytes invisíveis `EF BB BF` no início do arquivo que o Node.js não consegue interpretar.

### O que é BOM?

- **BOM** = Marcador de ordem de bytes (Byte Order Mark)
- Caractere invisível `U+FEFF` no início do arquivo
- Comum em editores Windows com encoding UTF-8 com BOM
- JSON não permite BOM, deve ser UTF-8 **sem BOM**

## ✅ **Solução Aplicada**

### 1️⃣ Remover BOM do package.json

```powershell
$content = [System.IO.File]::ReadAllText('package.json')
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText('package.json', $content, $utf8NoBom)
```

### 2️⃣ Configurar VS Code

Atualizado `.vscode/settings.json`:

```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false,
  "[json]": {
    "files.encoding": "utf8"
  }
}
```

### 3️⃣ Script Automático

Criado `scripts/fix-bom.ps1`:

```powershell
.\scripts\fix-bom.ps1
```

## 🔍 **Como Verificar**

### Método 1: PowerShell

```powershell
Get-Content package.json -First 1 -Encoding Byte | Format-Hex
```

**Correto (sem BOM):**

```
00000000   7B    # 0x7B = '{'
```

**Errado (com BOM):**

```
00000000   EF BB BF 7B    # EF BB BF = BOM
```

### Método 2: Node.js

```bash
node -e "console.log(require('./package.json'))"
```

Se der erro, tem BOM.

### Método 3: Script Fix-BOM

```powershell
.\scripts\fix-bom.ps1
```

## 🚀 **Scripts Disponíveis**

```bash
# Verificar e corrigir automaticamente
.\scripts\fix-bom.ps1

# Verificar manualmente
Get-Content package.json -First 1 -Encoding Byte
```

## 📋 **Prevenção**

### VS Code Settings (já configurado)

```json
{
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
```

### Git Config

```bash
git config --global core.autocrlf input
```

### EditorConfig

Adicionar ao `.editorconfig`:

```ini
[*.json]
charset = utf-8
insert_final_newline = false
```

## 🔗 **Arquivos Corrigidos**

- ✅ `package.json` - BOM removido
- ✅ `.vscode/settings.json` - Configurado encoding UTF-8
- ✅ `scripts/fix-bom.ps1` - Script de correção criado

## ⚠️ **Observações**

- **BOM** é comum no Windows com Notepad
- VS Code não adiciona BOM por padrão (desde versões recentes)
- PowerShell 5.1 adiciona BOM com `Out-File -Encoding UTF8`
- Use `System.Text.UTF8Encoding $false` para UTF-8 sem BOM

## 🐛 **Troubleshooting**

### Erro persiste após fix?

```powershell
# Deletar e recriar do git
Remove-Item package.json
git checkout package.json
```

### Outros arquivos JSON com BOM?

```powershell
# Corrigir todos de uma vez
.\scripts\fix-bom.ps1
```

### PowerShell cria BOM novamente?

```powershell
# Use .NET FileStream ao invés de Out-File
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText('arquivo.json', $content, $utf8NoBom)
```

## 📚 **Referências**

- [JSON Spec (RFC 8259)](https://datatracker.ietf.org/doc/html/rfc8259#section-8.1)
- [UTF-8 BOM FAQ](https://www.unicode.org/faq/utf_bom.html)
- [VS Code Encoding](https://code.visualstudio.com/docs/editor/codebasics#_file-encoding-support)
- [Node.js JSON Parsing](https://nodejs.org/api/json.html)

---

**Status:** ✅ **Resolvido**  
**Build:** ✅ **Funcionando**  
**Commit:** Próximo commit com script de prevenção
