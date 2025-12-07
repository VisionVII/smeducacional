# 🔧 DEBUG PROFISSIONAL - SISTEMA DE TEMA DO PROFESSOR

## ⚠️ PROBLEMA RELATADO

Cores não estão mudando ao selecionar tema na página `/teacher/theme`

## 🧪 PLANO DE TESTE SISTEMÁTICO

### Passo 1: Verificar se CSS Variables estão sendo injetadas

```javascript
// Abrir DevTools (F12) > Console
// Copiar e colar:

// 1. Verificar variáveis CSS no :root
const root = document.documentElement;
console.log('=== CSS VARIABLES INJETADAS ===');
console.log('--primary:', getComputedStyle(root).getPropertyValue('--primary'));
console.log(
  '--secondary:',
  getComputedStyle(root).getPropertyValue('--secondary')
);
console.log('--accent:', getComputedStyle(root).getPropertyValue('--accent'));
console.log(
  '--transition-duration:',
  getComputedStyle(root).getPropertyValue('--transition-duration')
);

// 2. Verificar se classe animations-enabled está presente
console.log('\n=== CLASSES NO HTML ===');
console.log(
  'animations-enabled:',
  root.classList.contains('animations-enabled')
);
```

**Resultado esperado:**

- `--primary: "221.2 83.2% 53.3%"` (ou outra cor conforme o tema)
- `--transition-duration: "200ms"`
- `animations-enabled: true`

---

### Passo 2: Testar a API de tema

```javascript
// No console do navegador:

console.log('=== TESTANDO API /api/teacher/theme ===');
fetch('/api/teacher/theme')
  .then((res) => res.json())
  .then((data) => {
    console.log('Resposta da API:', data);
    console.log('Theme name:', data.themeName);
    console.log('Primary color:', data.palette?.primary);
  })
  .catch((err) => console.log('ERRO:', err));
```

**Resultado esperado:**

```json
{
  "themeName": "Sistema Padrão",
  "palette": {
    "primary": "221.2 83.2% 53.3%",
    ...
  }
}
```

---

### Passo 3: Verificar se Tailwind está compilando cores dinamicamente

```javascript
// No console:

// Criar um elemento teste com classe text-primary
const test = document.createElement('div');
test.className = 'text-primary';
document.body.appendChild(test);

const computed = getComputedStyle(test).color;
test.remove();

console.log('=== TESTE TAILWIND ===');
console.log('text-primary computa para:', computed);
```

**Resultado esperado:**

- Deve mostrar uma cor RGB (convertida do HSL)
- Exemplo: `rgb(56, 89, 207)` ou similar

---

### Passo 4: Monitorar logs do TeacherThemeProvider

```javascript
// No console, filtre por '[TeacherThemeProvider]'
// Deve mostrar algo como:

// [TeacherThemeProvider] Mounted, loading theme...
// [loadTheme] Loaded theme: Sistema Padrão
// [applyTheme] Setting CSS variables: {mode: 'light', primary: '221.2 83.2% 53.3%', ...}
// [applyTheme] Theme applied successfully
```

---

### Passo 5: Testar mudança de tema

**Pré-requisitos:**

- Estar logado como professor
- Abrir DevTools (F12)
- Ir para `/teacher/theme`

**Procedimento:**

1. Abrir Console do DevTools
2. Executar:

   ```javascript
   // Monitor logs
   console.log('🔍 Monitorando mudanças de tema...');
   ```

3. Clicar em um tema diferente (ex: "Oceano")
4. **Observar no Console:**

   - Deve aparecer `[updateTheme] Updating theme with: {...}`
   - Deve aparecer `[applyTheme] Setting CSS variables: {...}`
   - A cor `--primary` deve mudar

5. **Observar na página:**
   - Cores devem mudar suavemente
   - Se houver `transition-theme`, elementos devem animar

---

## 📊 CENÁRIOS DE TESTE

### ✅ Cenário 1: Tema muda corretamente

- CSS variables são atualizadas ✓
- Cores na página mudam ✓
- Log da API mostra novo tema ✓

### ❌ Cenário 2: Tema NÃO muda

**Possíveis causas:**

1. API `/api/teacher/theme` retorna erro 401/403 → Verificar autenticação
2. Fetch falha → Verificar network tab
3. CSS variables não são injetadas → Verificar applyTheme()
4. Tailwind não compila → Verificar tailwind.config.ts

### ❌ Cenário 3: Cores mudam mas sem animação

- CSS variables mudam ✓
- Mas não há transição suave ✗
- **Solução:** Verificar se `.transition-theme` está presente nos elementos

---

## 🔍 CHECKLIST DE VERIFICAÇÃO

### Backend

- [ ] API `/api/teacher/theme` retorna 200 OK
- [ ] Resposta contém `palette` com 12 cores HSL
- [ ] Resposta contém `layout` com configurações
- [ ] PUT request salva tema corretamente no DB

### Frontend

- [ ] TeacherThemeProvider está envolvendo toda a app
- [ ] `useTeacherTheme()` pode ser chamado sem erros
- [ ] CSS variables são injetadas em `:root`
- [ ] Tailwind colors usam `hsl(var(--primary))` etc

### DOM

- [ ] Elements têm `.transition-theme` onde necessário
- [ ] `.animations-enabled` está presente em `:root` quando ativado
- [ ] Cores Tailwind (`text-primary`, `bg-accent`, etc) funcionam

### UX

- [ ] Clicar em theme aplica mudança imediatamente
- [ ] Cores mudam com transição suave (se habilitado)
- [ ] Modo claro/escuro funciona independentemente

---

## 🐛 TROUBLESHOOTING

### Problema: "Não vejo mudanças de cor"

**Debug:**

1. Verificar se você está autenticado (CHECK: header mostra nome do professor)
2. Abrir DevTools > Network
3. Clicar em tema
4. Procurar por requisição `PUT /api/teacher/theme`
5. Status deve ser 200, não 401

**Se status é 401:**

```
→ Problema: Não autenticado
→ Solução: Fazer login novamente
```

**Se status é 200:**

```
→ Problema: CSS variables não são injetadas
→ Debug: Executar no console:
   getComputedStyle(document.documentElement)
     .getPropertyValue('--primary')
```

### Problema: "Tema muda no banco mas não na página"

**Possível causa:** `applyTheme()` não está sendo chamado

**Debug:**

```javascript
// No console, filtre logs por 'applyTheme'
// Se não aparecer nenhum log após clicar em tema:
// → Problema em updateTheme() ou setTheme()
```

### Problema: "Cores mudam instantaneamente sem animação"

**Possível causa:** `.transition-theme` não está presente

**Debug:**

```javascript
// No console:
document.querySelectorAll('.transition-theme').length;
// Deve retornar > 0
```

---

## 📋 LOGS ESPERADOS (Sequência Normal)

Quando você clica em um tema, a sequência deve ser:

```
1. [updateTheme] Updating theme with: {palette: {...}, layout: {...}, themeName: "..."}
2. [updateTheme] API Response: {id: "...", palette: {...}, ...}
3. [applyTheme] Setting CSS variables: {mode: 'light', primary: '...', ...}
4. [applyTheme] Theme applied successfully
5. (No DOM) colors mudam na tela
```

Se falta algum desses passos, há um problema específico para investigar.

---

## 🎯 RESUMO FINAL

**Para validar se está funcionando:**

1. ✅ Abra DevTools (F12)
2. ✅ Vá para `/teacher/theme`
3. ✅ Clique em um tema diferente
4. ✅ Verifique:
   - Logs aparecem no console?
   - API retorna 200?
   - CSS variables mudam?
   - Cores na página mudam?

Se tudo acima funcionar → **Sistema está OK** ✓

Se algo falhar → **Investigar conforme guia acima** 🔧
