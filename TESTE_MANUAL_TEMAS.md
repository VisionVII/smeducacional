# 🧪 TESTE MANUAL - Sistema de Temas

## ⚡ Quick Start

Execute agora para testar as correções:

```bash
npm run dev
```

Abra: http://localhost:3000

---

## 📋 Checklist de Testes

### ✅ Teste 1: Cache Funcionando (2 min)

**Objetivo:** Verificar se tema carrega rápido da segunda vez

**Passos:**

1. ✅ Abra DevTools (F12) → Aba Console
2. ✅ Faça login como aluno (hvvctor@gmail.com)
3. ✅ Aguarde carregar dashboard (~2 segundos)
4. ✅ Veja no console:
   ```
   [StudentThemeProvider] Carregando tema do servidor...
   [StudentThemeProvider] Tema carregado com sucesso!
   ```
5. ✅ Pressione **F5** (recarregar página)
6. ✅ Veja no console (RÁPIDO!):
   ```
   [StudentThemeProvider] Usando tema do cache
   ```
7. ✅ Tempo esperado: **~50ms** ⚡

**Resultado Esperado:**

- ✅ Primeira carga: ~2 segundos
- ✅ Segunda carga: ~50ms (INSTANTÂNEO)

---

### ✅ Teste 2: Catálogo Não Quebra Cores (3 min)

**Objetivo:** Verificar que navegação para catálogo não quebra tema

**Passos:**

1. ✅ Login como aluno → Acesse `/student/courses`
2. ✅ Veja **cores do professor aplicadas** (ex: verde)
3. ✅ Clique no botão **"Catálogo"** no navbar
4. ✅ Página `/courses` abre com **cores públicas** (azul padrão)
5. ✅ Volte para área do aluno (logo ou navbar)
6. ✅ Veja **cores do professor novamente** (verde)
7. ✅ **SEM QUEBRAS, SEM DELAY!**

**DevTools Check:**

```javascript
// Console enquanto em /student/courses
document.documentElement.style.getPropertyValue('--primary');
// ↑ Deve mostrar: "221.2 83.2% 53.3%" (verde do professor)

// Console enquanto em /courses (catálogo)
document.documentElement.style.getPropertyValue('--primary');
// ↑ Deve mostrar: "222.2 47.4% 11.2%" (azul público)

// Console ao voltar para /student/courses
document.documentElement.style.getPropertyValue('--primary');
// ↑ Deve mostrar: "221.2 83.2% 53.3%" (verde novamente)
```

**Resultado Esperado:**

- ✅ Cores do professor em `/student/*`
- ✅ Cores públicas em `/courses`
- ✅ Sem conflito visual
- ✅ Transição suave

---

### ✅ Teste 3: Dark/Light Independente (2 min)

**Objetivo:** Verificar que dark/light são independentes entre roles

**Passos:**

1. ✅ Login como **aluno**
2. ✅ Clique no toggle dark mode (lua/sol)
3. ✅ Mude para **dark mode**
4. ✅ Abra DevTools → Application → Local Storage
5. ✅ Veja: `student-theme-mode: "dark"` ✅
6. ✅ Faça **logout**
7. ✅ Login como **professor** (outro usuário)
8. ✅ Professor ainda em **light mode** ✅
9. ✅ Veja: `teacher-theme-mode: "light"` ou `undefined`

**Resultado Esperado:**

- ✅ Aluno dark, Professor light (independentes)
- ✅ Storage keys diferentes:
  - `app-theme-mode` (páginas públicas)
  - `teacher-theme-mode` (professor)
  - `student-theme-mode` (aluno)

---

### ✅ Teste 4: Cache Expira em 5 Minutos (OPCIONAL)

**Objetivo:** Verificar que cache expira e recarrega

**Passos:**

1. ✅ Login como aluno, aguarde tema carregar
2. ✅ Abra DevTools → Application → Session Storage
3. ✅ Veja `student-theme-cache` com timestamp
4. ✅ **Aguarde 6 minutos** OU delete manualmente
5. ✅ Pressione F5
6. ✅ Veja no console:
   ```
   [StudentThemeProvider] Carregando tema do servidor...
   ```

**Resultado Esperado:**

- ✅ Cache válido por 5 minutos
- ✅ Após expirar, refaz fetches
- ✅ Tema recarregado do servidor

---

### ✅ Teste 5: Logout Limpa Cache (1 min)

**Objetivo:** Verificar que cache é limpo ao fazer logout

**Passos:**

1. ✅ Login como aluno
2. ✅ DevTools → Application → Session Storage
3. ✅ Veja `student-theme-cache` com dados
4. ✅ Faça **logout**
5. ✅ Veja Session Storage **vazio** ✅
6. ✅ Login novamente
7. ✅ Tema recarregado do zero (fresh)

**Resultado Esperado:**

- ✅ Cache limpo ao logout
- ✅ Próximo login: tema fresco do servidor

---

### ✅ Teste 6: Loading State Visual (1 min)

**Objetivo:** Verificar spinner durante primeira carga

**Passos:**

1. ✅ Abra navegador anônimo (Ctrl+Shift+N)
2. ✅ Acesse http://localhost:3000/login
3. ✅ Login como aluno
4. ✅ **VER SPINNER** com mensagem:
   ```
   🔄 Carregando tema personalizado...
   ```
5. ✅ Após ~2s, dashboard aparece

**Resultado Esperado:**

- ✅ Spinner elegante (borda girando)
- ✅ Mensagem clara
- ✅ Sem flash de conteúdo
- ✅ Transição suave

---

## 🐛 Troubleshooting

### Problema: "Cache não está funcionando"

**Sintomas:** Toda vez que F5, demora ~2s

**Solução:**

```javascript
// DevTools → Console
sessionStorage.getItem('student-theme-cache');
// ↑ Deve retornar JSON com theme e timestamp

// Se retornar null:
// 1. Verifique se está em navegador privado (não salva sessionStorage)
// 2. Verifique se tem erros no console
// 3. Limpe cache do navegador (Ctrl+Shift+Delete)
```

---

### Problema: "Catálogo ainda quebra cores"

**Sintomas:** Cores ficam estranhas ao navegar para `/courses`

**Solução:**

```javascript
// DevTools → Console (enquanto em /courses)
window.location.pathname;
// ↑ Deve mostrar: "/courses"

// Verifique se aparece no console:
('[StudentThemeProvider] Não está em página do aluno, não aplicando tema');

// Se NÃO aparecer, reporte o bug
```

---

### Problema: "Dark/light sincronizado"

**Sintomas:** Aluno muda dark, professor também muda

**Solução:**

```javascript
// DevTools → Application → Local Storage
// Deve ter 3 keys diferentes:
localStorage.getItem('app-theme-mode');
localStorage.getItem('teacher-theme-mode');
localStorage.getItem('student-theme-mode');

// Se estiver compartilhando key, limpe:
localStorage.clear();
// E recarregue
```

---

## 📸 Screenshots de Validação

### ✅ Console com Cache Hit

```
[StudentThemeProvider] Usando tema do cache
```

**Tempo:** ~50ms ⚡

### ✅ Console com Cache Miss

```
[StudentThemeProvider] Carregando tema do servidor...
[StudentThemeProvider] Tema carregado com sucesso!
```

**Tempo:** ~2s

### ✅ Console em Página Pública

```
[StudentThemeProvider] Não está em página do aluno, não aplicando tema
```

### ✅ Local Storage (3 Keys)

```
app-theme-mode: "light"
teacher-theme-mode: "dark"
student-theme-mode: "light"
```

---

## 🎯 Critérios de Sucesso

Para considerar as correções **100% funcionando**, todos devem passar:

- [ ] ✅ Cache reduz tempo de 2s → 50ms
- [ ] ✅ Catálogo não quebra cores
- [ ] ✅ Dark/light independente por role
- [ ] ✅ Cache expira em 5 minutos
- [ ] ✅ Logout limpa cache
- [ ] ✅ Loading spinner aparece

**Quando todos estiverem ✅ → PRONTO PARA PRODUÇÃO! 🚀**

---

## 🔍 Logs Esperados (Console)

### Primeira Carga (Cache Miss)

```
[StudentThemeProvider] Carregando tema do servidor...
GET /api/student/enrollments 200 in 500ms
GET /api/courses/cmj51lm71001ivcm3x3ct8tvw 200 in 450ms
GET /api/teacher/cmj51kgwq0001vcm3pdh2dile/theme 200 in 380ms
[StudentThemeProvider] Tema carregado com sucesso!
```

### Segunda Carga (Cache Hit)

```
[StudentThemeProvider] Usando tema do cache
```

### Navegando para Catálogo

```
[StudentThemeProvider] Não está em página do aluno, não aplicando tema
```

### Sem Cursos (Fallback)

```
[StudentThemeProvider] Sem cursos, usando tema padrão
```

---

## 🚀 Deploy em Produção

Após todos os testes passarem:

```bash
# 1. Build local
npm run build

# 2. Verificar build
✔ Compiled successfully
✔ Generating static pages (102/102)

# 3. Commit
git add .
git commit -m "fix: tema catálogo + cache performance"
git push origin main

# 4. Deploy Vercel (automático)
# Aguardar deploy...

# 5. Testar em produção
# https://smeducacional.vercel.app
```

---

## 📞 Suporte

Se encontrar algum problema:

1. ✅ Verifique console logs (F12)
2. ✅ Verifique Local Storage (Application tab)
3. ✅ Limpe cache (Ctrl+Shift+Delete)
4. ✅ Teste em navegador anônimo
5. ✅ Reporte com screenshot + console logs

---

Desenvolvido com excelência pela **VisionVII** 🚀
