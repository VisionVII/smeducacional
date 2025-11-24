# 📱 Guia de Acesso Mobile

Este guia mostra como acessar o sistema no seu celular durante o desenvolvimento.

---

## ✅ Opção 1: Acesso via Rede Local (Recomendado)

### Pré-requisitos
- Celular e PC na **mesma rede WiFi**
- Firewall do Windows permitindo conexões na porta 3000

### Passo a Passo

1. **Inicie o servidor:**
```bash
npm run dev
```

2. **No seu celular, acesse:**
```
http://10.59.178.99:3000
```

3. **Se não funcionar, libere o Firewall:**

Execute no PowerShell como **Administrador**:
```powershell
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

---

## 🌐 Opção 2: Ngrok (Acesso via Internet)

### Instalação

1. **Baixe o Ngrok:**
   - https://ngrok.com/download
   - Extraia o `ngrok.exe` em uma pasta

2. **Crie conta gratuita:**
   - https://dashboard.ngrok.com/signup
   - Copie seu authtoken

3. **Configure o authtoken:**
```bash
ngrok config add-authtoken SEU_TOKEN_AQUI
```

### Uso

1. **Inicie o servidor Next.js:**
```bash
npm run dev
```

2. **Em outro terminal, inicie o Ngrok:**
```bash
ngrok http 3000
```

3. **Acesse a URL gerada:**
```
https://xxxx-xxxx-xxxx.ngrok-free.app
```

**Vantagens:**
- ✅ Funciona de qualquer lugar (4G/5G)
- ✅ HTTPS automático
- ✅ Compartilhar com outros dispositivos

**Desvantagens:**
- ⚠️ URL muda a cada execução (plano gratuito)
- ⚠️ Requer conexão com internet
- ⚠️ Pode ter latência

---

## 📲 Opção 3: Localtunnel (Alternativa ao Ngrok)

### Instalação
```bash
npm install -g localtunnel
```

### Uso

1. **Inicie o servidor:**
```bash
npm run dev
```

2. **Em outro terminal:**
```bash
lt --port 3000
```

3. **Acesse a URL gerada no celular**

---

## 🔧 Troubleshooting

### Erro: "ERR_CONNECTION_REFUSED" no celular

**Solução 1: Verifique o IP do PC**
```bash
ipconfig
```
Use o IPv4 da sua rede WiFi principal.

**Solução 2: Libere o Firewall**
```powershell
# Execute como Administrador
New-NetFirewallRule -DisplayName "Next.js Dev Server" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
```

**Solução 3: Verifique se estão na mesma rede**
- PC e celular devem estar no mesmo WiFi
- Não use modo "Isolamento de Cliente" no roteador

### Erro: "This site can't provide a secure connection"

Use `http://` e não `https://` para acesso local:
```
✅ http://10.59.178.99:3000
❌ https://10.59.178.99:3000
```

---

## 🎯 Dicas de Teste Responsivo

### Ferramentas do Navegador (no PC)
- **Chrome DevTools:** `F12` → Toggle Device Toolbar (`Ctrl+Shift+M`)
- Simula diferentes tamanhos de tela
- Útil para testes rápidos

### Teste Real no Celular (Recomendado)
- Melhor para testar touch, gestos, performance
- Use o acesso via rede local para ver mudanças em tempo real

### Inspecionar no Celular
1. No PC, acesse: `chrome://inspect`
2. No celular, ative "Depuração USB" nas Opções do Desenvolvedor
3. Conecte via USB
4. Inspecione pelo Chrome do PC

---

## 📝 Notas Importantes

- **Hot Reload funciona:** Alterações no código aparecem automaticamente no celular
- **Sempre use a mesma rede WiFi** para evitar problemas
- **Ngrok é melhor** se precisar mostrar para outras pessoas ou testar fora de casa
- **Rede local é mais rápido** e não depende de internet

---

## 🚀 Recomendação

Para desenvolvimento diário:
1. Use **acesso via rede local** (mais rápido)
2. Mantenha o celular do lado enquanto desenvolve
3. Teste cada mudança no mobile imediatamente
4. Use Ngrok apenas quando precisar mostrar para outros ou testar fora de casa
