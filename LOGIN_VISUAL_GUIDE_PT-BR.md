# 🎯 GUIA VISUAL: Do Login ao Dashboard

## 1️⃣ CRIAR USUÁRIOS (30 segundos)

```bash
node scripts/create-test-users.mjs
```

**Saída esperada:**

```
🧪 CRIANDO USUÁRIOS DE TESTE

✅ aluno@teste.com
   Nome: João Aluno
   Senha: Aluno@123456
   Role: STUDENT

✅ professor@teste.com
   Nome: Maria Professor
   Senha: Professor@123456
   Role: TEACHER

✅ admin@teste.com
   Nome: Admin Teste
   Senha: Admin@123456
   Role: ADMIN

✨ Usuários criados com sucesso!
```

---

## 2️⃣ ABRIR LOGIN

URL: `http://localhost:3000/login`

**Você verá:**

```
┌─────────────────────────────────────┐
│      🎓 SM Educa                    │
│                                     │
│  [email______________________]      │
│                                     │
│  [password__________________]       │
│                                     │
│  [ ] Lembrar-me                     │
│                                     │
│  [  Fazer Login  ]  [Google]        │
│                                     │
│  Não tem conta? Cadastre-se         │
│  Esqueceu a senha? Recuperar        │
└─────────────────────────────────────┘
```

---

## 3️⃣ FAZER LOGIN

**Copie uma credencial do terminal acima:**

```
Email:    aluno@teste.com
Senha:    Aluno@123456
```

**Colar no formulário:**

```
[aluno@teste.com________]
[Aluno@123456___________]
[ ✓ Lembrar-me]
[  Fazer Login  ]
```

**Clicar em "Fazer Login"**

---

## 4️⃣ REDIRECIONAMENTO AUTOMÁTICO

**Você vê:**

```
⏳ Redirecionando para o dashboard...
```

**2 segundos depois → Dashboard carrega**

---

## 5️⃣ VOCÊ ESTÁ NO DASHBOARD! 🎉

**Navbar superior mostra:**

```
┌──────────────────────────────────────────────┐
│  SM Educa    [🔔] [🛒] [☀️] [🇧🇷] [👤▼]      │
└──────────────────────────────────────────────┘
           ↑ NOTIFICATIONBELL AQUI
```

**Menu lateral mostra:**

```
├─ 🏠 Início
├─ 📚 Meus Cursos
├─ 📋 Atividades
├─ 🏆 Certificados
├─ 💬 Mensagens
├─ [🔔 Notificações] ← NOVO!
├─ ⚙️ Tema
├─ 👤 Perfil
└─ 📚 Catálogo
```

---

## 6️⃣ TESTAR NOTIFICATIONBELL

**Clique no ícone de sino (🔔) na navbar**

**Dropdown abre mostrando:**

```
┌──────────────────────────────────┐
│  Notificações Recentes           │
│                                  │
│  [Nenhuma notificação por enquanto]
│                                  │
│  ────────────────────────────   │
│  [  Ver todas as notificações  ] │
└──────────────────────────────────┘
```

---

## 7️⃣ ABRIR PÁGINA DE NOTIFICAÇÕES

**Clique em "Ver todas as notificações"**

URL muda para: `http://localhost:3000/notifications`

**Você vê:**

```
┌────────────────────────────────────────┐
│  Notificações                          │
│                                        │
│  [Todas] [Não lidas] [Lidas] [Arquivadas]
│                                        │
│  📭 Nenhuma notificação no momento     │
│                                        │
└────────────────────────────────────────┘
```

---

## 8️⃣ TESTAR RATE LIMITING (Opcional)

**Abrir DevTools (F12) → Console**

```javascript
// Executar 150 requisições rápidas
for (let i = 0; i < 150; i++) {
  fetch('/api/notifications/unread-count');
}

// Próximas requisições retornarão HTTP 429:
// {error: "Limite de requisições atingido"}
```

**Headers na resposta:**

```
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 45
```

---

## 9️⃣ TESTAR COM DIFERENTES ROLES

**Logout e faça login com outro usuário:**

```bash
# Logout clicando no avatar (canto superior direito)
# → Sign Out

# Fazer login com teacher:
Email:    professor@teste.com
Senha:    Professor@123456

# Você vai para: /teacher/dashboard
# NotificationBell ainda está disponível ✅
```

**Repetar com admin:**

```
Email:    admin@teste.com
Senha:    Admin@123456

# Você vai para: /admin
# Clique em "SM Educa Admin" na navbar
# NotificationBell está no AdminHeader ✅
```

---

## 🔟 TESTAR APIS COM CURL (Avançado)

```bash
# 1. Obter Cookie de Sessão
# (Feito automaticamente via browser)

# 2. Listar notificações
curl http://localhost:3000/api/notifications \
  -H "Cookie: next-auth.session-token=..." \
  --json

# Resposta esperada:
# {
#   "notifications": [],
#   "total": 0
# }

# 3. Obter contagem não lida
curl http://localhost:3000/api/notifications/unread-count \
  --json

# Resposta esperada:
# {
#   "unreadCount": 0,
#   "X-RateLimit-Remaining": 299,
#   "X-RateLimit-Reset": 45
# }
```

---

## 📝 CHECKLIST FINAL

- [ ] Executei `node scripts/create-test-users.mjs`
- [ ] Abri http://localhost:3000/login
- [ ] Fiz login com aluno@teste.com / Aluno@123456
- [ ] Fui redirecionado para /student/dashboard
- [ ] Vejo NotificationBell (🔔) na navbar
- [ ] Cliquei em NotificationBell → dropdown abriu
- [ ] Cliquei em "Ver todas" → página /notifications abriu
- [ ] Testei logout/login com professor e admin
- [ ] Tudo funciona! ✨

---

## ❌ SE NÃO FUNCIONAR...

### Erro: "Usuário não encontrado"

→ Terminal não criou usuários  
→ Solução: `node scripts/create-test-users.mjs`

### Erro: "Credenciais inválidas"

→ Email/senha copiados errado  
→ Solução: Copiar exatamente do terminal

### Não redireciona após login

→ Cookie não está sendo salvo  
→ Solução:

```bash
# 1. Limpar cookies (F12 → Application → Cookies → Delete All)
# 2. Fechar browser e abrir novamente
# 3. Tentar login
# 4. Se ainda não funcionar: rm -rf .next && npm run dev
```

### NotificationBell não aparece

→ Página não foi carregada completamente  
→ Solução:

```bash
# Recarregar página: Ctrl+Shift+R (limpar cache)
```

---

## 🎓 PRÓXIMAS AÇÕES

### Após Login Funcionar

1. **Testar envio de notificações:**

   ```typescript
   // No código da aplicação, chamar:
   await NotificationService.createNotification(
     userId,
     'COURSE_PURCHASED',
     'Compra bem-sucedida!',
     'Você comprou um curso'
   );
   ```

2. **Integrar em endpoints:**

   - `/api/checkout` → COURSE_PURCHASED
   - `/api/lessons` → LESSON_AVAILABLE
   - `/api/reviews` → COURSE_REVIEW

3. **Configurar Resend:**

   - Gerar API key
   - Adicionar a .env.local
   - Testar envio de email

4. **Monitorar produção:**
   - Logs em Sentry
   - Alertas de taxa de erro
   - Dashboard de métricas

---

## 📞 PRECISA DE AJUDA?

| Nível       | Ação                                      |
| ----------- | ----------------------------------------- |
| 🟢 Rápido   | Leia `LOGIN_QUICK_FIX.md`                 |
| 🟡 Médio    | Leia `LOGIN_TROUBLESHOOTING_PT-BR.md`     |
| 🔴 Avançado | Execute `node scripts/diagnose-login.mjs` |

---

**Parabéns! Seu sistema de notificações está rodando! 🎉**

**Desenvolvido com excelência pela VisionVII — Inovação e Transformação Digital.**
