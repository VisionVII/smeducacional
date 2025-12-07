# 🔧 Clean Ports - Liberador de Portas

Script PowerShell para **limpar processos Node.js** e garantir que a **porta 3000 esteja livre** antes de iniciar o servidor de desenvolvimento.

## 🎯 **Quando Usar**

Use este script quando:

- ❌ O servidor não inicia na porta 3000
- ⚠️ Porta muda automaticamente (3001, 3002, etc.)
- 🔄 Processos Node órfãos continuam rodando
- 💥 Erro "Port 3000 is already in use"

## 🚀 **Como Usar**

### Opção 1: Via NPM Script (Recomendado)

```bash
npm run clean:ports
```

### Opção 2: Direto no PowerShell

```powershell
.\scripts\clean-ports.ps1
```

### Opção 3: Integrado no Start

```bash
npm run clean:ports && npm run dev
```

## ⚙️ **O Que Faz**

1. 🔍 **Busca** todos os processos Node.js ativos
2. 🛑 **Encerra** processos Node.js encontrados
3. 🔎 **Verifica** se a porta 3000 está ocupada
4. ✨ **Libera** a porta 3000 se necessário
5. ✅ **Confirma** que está tudo pronto

## 📊 **Saída Exemplo**

```
🔍 Verificando processos Node.js...
⚠️  Encontrados 3 processos Node.js ativos
🛑 Encerrando processos...
   ✓ Processo 12345 encerrado
   ✓ Processo 67890 encerrado
   ✓ Processo 11111 encerrado
✅ Porta 3000 está livre!

🚀 Você pode iniciar o servidor agora com: npm run dev
```

## 🔗 **Adicionando ao package.json**

```json
{
  "scripts": {
    "clean:ports": "pwsh -File scripts/clean-ports.ps1",
    "dev:clean": "npm run clean:ports && npm run dev"
  }
}
```

## ⚠️ **Observações**

- ⚡ Requer **PowerShell** (já vem no Windows)
- 🛡️ Pode pedir permissão de administrador
- 💡 Encerra **TODOS** processos Node.js (cuidado se tiver outros projetos)
- 🎯 Focado na porta **3000** (porta padrão Next.js)

## 🐛 **Troubleshooting**

### Erro: "Execution Policy"

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Erro: "Access Denied"

Execute o PowerShell como **Administrador**

### Porta ainda ocupada após script

Verifique manualmente:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

## 📚 **Links Relacionados**

- [Next.js Port Configuration](https://nextjs.org/docs/api-reference/cli#development)
- [Node.js Process Management](https://nodejs.org/api/process.html)
- [PowerShell Net Module](https://docs.microsoft.com/powershell/module/nettcpip/)
