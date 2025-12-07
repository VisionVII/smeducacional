# 🔌 Por Que a Porta Muda no Projeto?

## 🎯 **Resposta Rápida**

A porta muda de **3000** para **3001, 3002**, etc. porque:
1. ❌ **Processos Node órfãos** continuam rodando em background
2. 🔄 Next.js **auto-incrementa** a porta quando 3000 está ocupada
3. 💥 Servidores travados/não encerrados corretamente

---

## 🔍 **Como Acontece**

### Cenário 1: Terminal Fechado Sem Parar Servidor
```bash
npm run dev           # Inicia na porta 3000
# Fechar terminal sem Ctrl+C
npm run dev           # ❌ Porta 3000 ocupada → usa 3001
```

### Cenário 2: Múltiplos Terminais
```bash
# Terminal 1
npm run dev           # Porta 3000 ✅

# Terminal 2 (esqueceu do primeiro)
npm run dev           # Porta 3001 ⚠️
```

### Cenário 3: Crash/Hot Reload Bug
```bash
npm run dev           # Porta 3000
# Hot reload trava, processo fica zombie
npm run dev           # Porta 3001
```

---

## 📊 **Diagnóstico**

### Verificar Processos Node Ativos
```powershell
Get-Process node -ErrorAction SilentlyContinue | Select-Object Id, ProcessName
```

### Verificar Porta 3000
```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen
```

**Saída de exemplo:**
```
LocalAddress  LocalPort  RemoteAddress  RemotePort  State       OwningProcess
------------  ---------  -------------  ----------  -----       -------------
0.0.0.0       3000       0.0.0.0        0           Listen      12345
```

---

## ✅ **Soluções**

### 🔥 **Solução Rápida** (Limpar Tudo)
```bash
npm run clean:engine
npm run dev
```

### 🎯 **Solução Automática** (Script Dedicado)
```bash
npm run clean:ports
npm run dev
```

Ou use o comando combinado:
```bash
npm run dev:clean
```

### 🛠️ **Solução Manual**
```powershell
# 1. Matar todos processos Node
Get-Process node | Stop-Process -Force

# 2. Verificar porta 3000
Get-NetTCPConnection -LocalPort 3000 -State Listen

# 3. Se ainda ocupada, matar processo específico
Stop-Process -Id <PROCESS_ID> -Force

# 4. Iniciar servidor
npm run dev
```

---

## 🚀 **Scripts Disponíveis**

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia servidor (porta automática) |
| `npm run dev:clean` | Limpa portas + inicia |
| `npm run clean:engine` | Mata todos processos Node |
| `npm run clean:ports` | Script inteligente de limpeza |
| `npm run clean` | Limpeza completa (modules + cache + processos) |

---

## 🔧 **Fixar Porta 3000**

### Opção 1: Variável de Ambiente
Crie `.env.local`:
```env
PORT=3000
```

### Opção 2: Script package.json
```json
{
  "scripts": {
    "dev": "next dev --turbopack --port 3000"
  }
}
```

### Opção 3: Sempre Limpar Antes
```json
{
  "scripts": {
    "dev": "npm run clean:engine && next dev --turbopack"
  }
}
```

---

## ⚠️ **Comportamento do Next.js**

O Next.js **automaticamente** procura portas livres:
```
Port 3000 is in use, trying 3001 instead...
Port 3001 is in use, trying 3002 instead...
Port 3002 is in use, trying 3003 instead...
```

Isso é **intencional** para evitar conflitos, mas pode confundir quando você espera sempre a porta 3000.

---

## 🐛 **Troubleshooting**

### Problema: Script Não Funciona
```powershell
# Habilitar execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problema: "Access Denied"
Execute PowerShell como **Administrador**

### Problema: Processo Invisível
```powershell
# Buscar todos processos usando porta 3000
Get-NetTCPConnection -LocalPort 3000 | Select-Object OwningProcess
```

### Problema: VS Code Tasks em Background
1. Abra **Terminal → Running Tasks**
2. Encerre tarefas `npm dev` antigas
3. Ou: **Developer → Reload Window**

---

## 📚 **Boas Práticas**

✅ **SEMPRE** pare o servidor com `Ctrl+C` antes de fechar terminal  
✅ Use `npm run clean:engine` quando trocar de branch  
✅ Adicione `PORT=3000` no `.env.local`  
✅ Configure VS Code tasks com `"isBackground": true` corretamente  
✅ Use o script `dev:clean` quando houver dúvida  

❌ **NUNCA** force quit do terminal sem parar servidor  
❌ Não rode múltiplos `npm run dev` simultaneamente  
❌ Não ignore mensagens "Port in use"  

---

## 🔗 **Links Relacionados**

- [Next.js CLI Options](https://nextjs.org/docs/api-reference/cli#development)
- [Node.js Process Signals](https://nodejs.org/api/process.html#signal-events)
- [PowerShell Process Management](https://docs.microsoft.com/powershell/module/microsoft.powershell.management/get-process)

---

## 📞 **Checklist Rápido**

Antes de iniciar o dev server:

- [ ] Parei o servidor anterior com `Ctrl+C`?
- [ ] Fechei todos terminais antigos?
- [ ] Rodei `npm run clean:engine` após trocar branches?
- [ ] Verifiquei processos Node ativos?
- [ ] Configurei `PORT=3000` no `.env.local`?

Se marcou **NÃO** em algum:
```bash
npm run dev:clean
```

---

**💡 Dica Pro:** Adicione alias no PowerShell profile:
```powershell
# ~\Documents\PowerShell\Microsoft.PowerShell_profile.ps1
function killnode { Get-Process node | Stop-Process -Force }
Set-Alias kn killnode
```

Uso: `kn` → mata todos processos Node!
