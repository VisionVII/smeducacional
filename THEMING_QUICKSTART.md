# ⚡ Instalação Rápida - Sistema de Temas

## 🎯 Checklist de Instalação

- [ ] Executar migration SQL
- [ ] Gerar Prisma Client
- [ ] Testar API
- [ ] Acessar UI de customização

## 📝 Passo a Passo

### 1️⃣ Executar Migration SQL

**No Supabase Dashboard:**

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo de `prisma/add-teacher-theme.sql`:

```sql
CREATE TABLE IF NOT EXISTS teacher_themes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  palette JSONB NOT NULL DEFAULT '{"background":"0 0% 100%","foreground":"240 10% 3.9%","primary":"221.2 83.2% 53.3%","primaryForeground":"210 40% 98%","secondary":"210 40% 96.1%","secondaryForeground":"222.2 47.4% 11.2%","accent":"210 40% 96.1%","accentForeground":"222.2 47.4% 11.2%","card":"0 0% 100%","cardForeground":"240 10% 3.9%","muted":"210 40% 96.1%","mutedForeground":"215.4 16.3% 46.9%"}',
  layout JSONB NOT NULL DEFAULT '{"cardStyle":"default","borderRadius":"0.5rem","shadowIntensity":"medium","spacing":"comfortable"}',
  theme_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_teacher_themes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_teacher_themes_user_id ON teacher_themes(user_id);
```

6. Clique em **RUN** (ou Ctrl+Enter)
7. Confirme: "Success. No rows returned"

### 2️⃣ Gerar Prisma Client

```powershell
npx prisma generate
```

✅ Aguarde: "Generated Prisma Client"

### 3️⃣ Testar API

**Iniciar servidor:**

```powershell
npm run dev
```

**Fazer login como professor e acessar:**

```
http://localhost:3000/teacher/theme
```

### 4️⃣ Verificar Funcionamento

- [ ] Página de temas carrega sem erros
- [ ] 6 presets exibidos na aba "Temas Prontos"
- [ ] Clicar em preset aplica tema instantaneamente
- [ ] Aba "Cores" mostra 12 campos editáveis
- [ ] Aba "Layout" mostra 4 configurações
- [ ] Botão "Salvar" funciona e exibe toast de sucesso
- [ ] Recarregar página mantém tema aplicado

## 🐛 Problemas Comuns

### ❌ Erro: "Table already exists"

**Solução**: Tabela já criada. Pule para passo 2.

### ❌ Erro: "Module not found: @/components/teacher-theme-provider"

**Solução**:

```powershell
# Verificar se arquivo existe
Test-Path src\components\teacher-theme-provider.tsx

# Se não existir, recriar arquivo
# (copiar conteúdo do repositório)
```

### ❌ Erro: "Cannot read properties of undefined (reading 'palette')"

**Solução**: Tema não carregou. Verificar:

1. API `/api/teacher/theme` retorna 200
2. Console do navegador não mostra erros
3. `TeacherThemeProvider` envolve layout em `src/app/teacher/layout.tsx`

### ❌ Página `/teacher/theme` retorna 404

**Solução**: Criar arquivo `src/app/teacher/theme/page.tsx` (copiar do repositório)

## 🧪 Testes Rápidos

### Teste 1: GET tema padrão

```powershell
# Abrir DevTools > Network
# Acessar /teacher/theme
# Verificar request para /api/teacher/theme
# Response deve conter palette e layout
```

### Teste 2: Aplicar preset

```
1. Clicar em "Oceano" na aba "Temas Prontos"
2. Verificar cores mudarem instantaneamente
3. Recarregar página
4. Tema deve permanecer aplicado
```

### Teste 3: Editar cor manualmente

```
1. Ir para aba "Cores"
2. Mudar "Primary" para: 350 89% 60%
3. Clicar "Salvar Cores"
4. Ver toast de sucesso
5. Verificar botões mudarem para rosa/vermelho
```

## 📊 Verificar no Banco de Dados

**SQL Editor (Supabase):**

```sql
-- Ver temas criados
SELECT
  id,
  user_id,
  theme_name,
  created_at
FROM teacher_themes;

-- Ver tema de um professor específico
SELECT * FROM teacher_themes
WHERE user_id = 'SEU_USER_ID';
```

## ✅ Instalação Completa!

Se todos os testes passaram, o sistema está funcionando. Próximos passos:

1. **Explorar presets**: Teste os 6 temas prontos
2. **Personalizar**: Crie seu próprio tema na aba "Cores"
3. **Ajustar layout**: Configure estilos de card e espaçamento
4. **Compartilhar**: Documente temas criados para outros professores

## 📚 Documentação Completa

Consulte `THEMING.md` para:

- Guia detalhado de uso
- Formato HSL explicado
- Boas práticas de acessibilidade
- Troubleshooting avançado
- API reference completo

---

**Tempo estimado de instalação**: 5 minutos  
**Dificuldade**: ⭐⭐☆☆☆ (Fácil)
