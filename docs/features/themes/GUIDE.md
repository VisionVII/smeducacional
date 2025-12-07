# 🎨 Sistema de Temas Personalizados

## Visão Geral

Sistema completo de personalização visual que permite cada professor customizar as cores, layout e aparência da sua área do sistema.

## 🚀 Funcionalidades

### 1. **Temas Prontos (Presets)**

6 temas pré-configurados profissionais:

- **Azul Padrão**: Tema clássico e profissional
- **Oceano**: Tons de azul e verde água
- **Pôr do Sol**: Tons quentes de laranja e rosa
- **Floresta**: Verde natural e terroso
- **Meia-Noite**: Roxo profundo e elegante
- **Minimalista**: Design limpo e monocromático

### 2. **Customização de Cores**

Controle total sobre 12 tokens de cores (formato HSL):

- `background` - Cor de fundo principal
- `foreground` - Cor do texto principal
- `primary` - Cor primária (botões, links)
- `primaryForeground` - Texto sobre cor primária
- `secondary` - Cor secundária
- `secondaryForeground` - Texto sobre cor secundária
- `accent` - Cor de destaque
- `accentForeground` - Texto sobre cor de destaque
- `card` - Fundo dos cards
- `cardForeground` - Texto dos cards
- `muted` - Cor de elementos desabilitados
- `mutedForeground` - Texto de elementos desabilitados

### 3. **Configurações de Layout**

Personalize a estrutura visual:

- **Estilo dos Cards**: default, bordered, elevated, flat
- **Arredondamento**: controle de border-radius
- **Intensidade da Sombra**: none, light, medium, strong
- **Espaçamento**: compact, comfortable, spacious

### 4. **Pré-visualização em Tempo Real**

Todas as mudanças são aplicadas instantaneamente, permitindo visualizar o resultado antes de salvar.

## 📁 Estrutura de Arquivos

```
/prisma
  ├── add-teacher-theme.sql          # Migration SQL
  └── schema.prisma                  # Model TeacherTheme

/src/app/api/teacher/theme
  └── route.ts                       # GET/PUT endpoints

/src/app/teacher
  ├── layout.tsx                     # Provider wrapper
  └── theme/
      └── page.tsx                   # UI de customização

/src/components
  └── teacher-theme-provider.tsx     # React Context + aplicação CSS vars

/src/lib
  └── theme-presets.ts               # 6 temas pré-configurados
```

## 🔧 Como Usar

### Para Usuários (Professores)

1. **Acessar Personalização**

   - Faça login como professor
   - Vá para: `/teacher/theme`
   - Ou clique em "Tema" no menu lateral

2. **Aplicar Tema Pronto**

   - Aba "Temas Prontos"
   - Clique no card do tema desejado
   - Mudanças aplicadas automaticamente

3. **Personalizar Cores**

   - Aba "Cores"
   - Edite os valores HSL (exemplo: `221.2 83.2% 53.3%`)
   - Use o seletor de cor visual ao lado de cada campo
   - Clique "Salvar Cores"

4. **Ajustar Layout**

   - Aba "Layout"
   - Selecione estilo de cards
   - Defina arredondamento (exemplo: `0.5rem`)
   - Escolha intensidade de sombra
   - Selecione espaçamento
   - Clique "Salvar Layout"

5. **Restaurar Padrão**
   - Role até "Ações"
   - Clique "Restaurar Padrão"

### Para Desenvolvedores

#### 1. Executar Migration SQL

**Opção A - Supabase Dashboard:**

```sql
-- Copie o conteúdo de prisma/add-teacher-theme.sql
-- Cole no SQL Editor do Supabase
-- Execute a query
```

**Opção B - Prisma CLI (se DIRECT_URL configurado):**

```powershell
npx prisma db push
```

#### 2. Gerar Prisma Client

```powershell
npx prisma generate
```

#### 3. Verificar Instalação

```powershell
# Verificar tabela criada
# No Supabase SQL Editor:
SELECT * FROM teacher_themes LIMIT 1;
```

#### 4. Testar API

```javascript
// GET - Obter tema atual
fetch('/api/teacher/theme');

// PUT - Atualizar tema
fetch('/api/teacher/theme', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    palette: {
      primary: '199 89% 48%',
      secondary: '187 85% 43%',
      // ...outros tokens
    },
    layout: {
      cardStyle: 'elevated',
      borderRadius: '0.75rem',
      shadowIntensity: 'medium',
      spacing: 'comfortable',
    },
    themeName: 'Meu Tema Personalizado',
  }),
});
```

## 🎨 Formato de Cores HSL

O sistema usa **HSL (Hue, Saturation, Lightness)** para flexibilidade:

### Estrutura

```
HUE SATURATION% LIGHTNESS%
```

### Exemplos

```
221.2 83.2% 53.3%  // Azul vibrante
199 89% 48%        // Azul oceano
24 95% 53%         // Laranja intenso
142 71% 45%        // Verde floresta
```

### Dicas

- **Hue (0-360)**: Matiz da cor
  - 0° = Vermelho
  - 120° = Verde
  - 240° = Azul
- **Saturation (0-100%)**: Intensidade
  - 0% = Cinza
  - 100% = Cor pura
- **Lightness (0-100%)**: Luminosidade
  - 0% = Preto
  - 50% = Cor normal
  - 100% = Branco

### Ferramentas Úteis

- [HSL Color Picker](https://hslpicker.com/)
- [Coolors](https://coolors.co/)
- Chrome DevTools (Color Picker)

## 🔒 Segurança

### Validação de Dados

- Zod schema valida formato HSL com regex
- Limite de payload: 10KB
- Validação de valores de enum (cardStyle, shadowIntensity, spacing)

### Controle de Acesso

- Apenas usuários com role `TEACHER` ou `ADMIN`
- Cada professor só edita seu próprio tema
- Foreign key cascade delete (tema removido se usuário deletado)

### Rate Limiting

Considere adicionar em produção:

```typescript
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minuto
  uniqueTokenPerInterval: 500,
});

await limiter.check(request, 10, 'THEME_UPDATE'); // 10 req/min
```

## 📱 Mobile-First

### Responsividade

- Grid de presets: 1 coluna (mobile) → 2 (tablet) → 3 (desktop)
- Tabs horizontalmente deslizáveis em telas pequenas
- Color pickers com touch targets de 44x44px
- Scroll suave em listas longas

### Performance

- Debounce em inputs de cores (evita re-renders excessivos)
- CSS vars aplicadas no `:root` (sem re-mount de componentes)
- Lazy loading de preview cards

## ♿ Acessibilidade (WCAG AA)

### Contraste de Cores

Sempre verifique contraste mínimo:

- **Texto normal**: 4.5:1
- **Texto grande**: 3:1
- **Componentes UI**: 3:1

### Ferramentas de Verificação

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- Chrome DevTools > Lighthouse > Accessibility

### Boas Práticas

```typescript
// Validar contraste antes de salvar
import { getContrast } from '@/lib/color-utils';

const contrast = getContrast(
  customPalette.primary,
  customPalette.primaryForeground
);

if (contrast < 4.5) {
  toast({
    title: 'Atenção',
    description: 'Contraste insuficiente. Ajuste as cores.',
    variant: 'warning',
  });
}
```

## 🧪 Testes

### Teste Manual

1. Aplicar cada preset e verificar consistência visual
2. Editar cores manualmente e verificar preview
3. Salvar tema e recarregar página (persistência)
4. Testar em mobile/tablet/desktop
5. Verificar acessibilidade com leitor de tela

### Teste de API

```powershell
# GET tema padrão (novo usuário)
curl http://localhost:3000/api/teacher/theme

# PUT tema personalizado
curl -X PUT http://localhost:3000/api/teacher/theme \
  -H "Content-Type: application/json" \
  -d '{"palette":{"primary":"199 89% 48%"},"themeName":"Teste"}'

# Verificar erro de validação (HSL inválido)
curl -X PUT http://localhost:3000/api/teacher/theme \
  -H "Content-Type: application/json" \
  -d '{"palette":{"primary":"invalid"}}'
```

## 🐛 Troubleshooting

### Tema não aplica após salvar

1. Verificar console do navegador
2. Confirmar que API retorna 200
3. Limpar cache do navegador
4. Verificar se `TeacherThemeProvider` envolve o layout

### Cores incorretas

1. Validar formato HSL (sem `hsl()` wrapper)
2. Verificar espaços entre valores
3. Confirmar % nos valores de saturação/luminosidade

### Migration SQL falha

1. Verificar se tabela já existe: `SELECT * FROM teacher_themes;`
2. Usar `CREATE TABLE IF NOT EXISTS`
3. Executar no Supabase Dashboard (não via Prisma em pooler mode)

### Performance lenta

1. Adicionar index em `userId` (já incluído na migration)
2. Verificar tamanho do JSON (máx 10KB)
3. Implementar rate limiting

## 📊 Banco de Dados

### Schema

```prisma
model TeacherTheme {
  id        String   @id @default(cuid())
  userId    String   @unique
  palette   Json     @default("{...}")
  layout    Json     @default("{...}")
  themeName String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(...)

  @@index([userId])
  @@map("teacher_themes")
}
```

### Queries Úteis

```sql
-- Temas mais usados
SELECT theme_name, COUNT(*) as usage_count
FROM teacher_themes
WHERE theme_name IS NOT NULL
GROUP BY theme_name
ORDER BY usage_count DESC;

-- Usuários sem tema personalizado
SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN teacher_themes tt ON u.id = tt.user_id
WHERE u.role = 'TEACHER' AND tt.id IS NULL;

-- Limpar temas órfãos (caso FK não funcione)
DELETE FROM teacher_themes
WHERE user_id NOT IN (SELECT id FROM users);
```

## 🚀 Próximos Passos

### Funcionalidades Futuras

- [ ] Exportar/importar temas (JSON)
- [ ] Galeria pública de temas compartilhados
- [ ] Dark mode toggle automático
- [ ] Preview de tema antes de aplicar
- [ ] Histórico de temas (undo/redo)
- [ ] Sugestões de combinações de cores acessíveis
- [ ] Tema por curso (multi-tema por professor)

### Melhorias de UX

- [ ] Color picker visual (sem digitar HSL)
- [ ] Paleta de cores complementares sugeridas
- [ ] Preview em diferentes dispositivos
- [ ] Comparação lado a lado de temas
- [ ] Templates sazonais (Natal, verão, etc.)

## 📚 Referências

- [Tailwind CSS Theming](https://tailwindcss.com/docs/theme)
- [Shadcn/ui Theming](https://ui.shadcn.com/docs/theming)
- [HSL Color Model](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design Color System](https://material.io/design/color)

## 👨‍💻 Suporte

Dúvidas ou problemas? Entre em contato:

- Abra uma issue no repositório
- Consulte a documentação do Prisma: https://prisma.io/docs
- Verifique logs em `/api/teacher/theme` (console do servidor)

---

**Versão**: 1.0.0  
**Última atualização**: Dezembro 2024  
**Autor**: Sistema Educacional SM
