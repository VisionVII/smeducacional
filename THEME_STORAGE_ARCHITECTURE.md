# 🎨 Arquitetura de Armazenamento de Temas e Configurações

## 📋 Estrutura de Dados Atual

### 1. Admin (Configurações do Sistema)

**Tabela**: `SystemConfig`
**Chave**: `key = "system"`
**Dados**:

- companyName, systemName
- logoUrl, faviconUrl, loginBgUrl
- primaryColor, secondaryColor
- metaTitle, metaDescription, metaKeywords
- Redes sociais (facebook, instagram, linkedin, twitter, youtube)
- maintenanceMode, registrationEnabled

**API**: `PUT /api/admin/system-config`
**Salvamento**: Upsert com Zod validation

### 2. Professor (Tema Personalizado)

**Tabela**: `User` (campo `landingTheme` - JSON)
**Dados** armazenados:

```json
{
  "palette": { ... 12 cores ... },
  "layout": { cardStyle, borderRadius, shadowIntensity, spacing },
  "animations": { enabled, duration, easing, transitions, hover, focus, pageTransitions },
  "themeName": string
}
```

**API**: `PUT /api/teacher/landing/theme`
**Salvamento**: Update com merge automático de campos parciais

### 3. Aluno

**Não possui tema personalizado**
Usa: tema do admin (cores system config)

## 🔄 Fluxo de Aplicação de Temas

### Rota Pública (sem login) - `/courses`, `/`

```
PublicThemeProvider
  ↓
Carrega: SystemConfig.primaryColor, secondaryColor
  ↓
CSS vars setadas: --primary, --secondary
```

### Dashboard Admin - `/admin/*`

```
RootLayout (ThemeProvider)
  ↓
AdminLayout
  ↓
Usa: SystemConfig (cores do sistema)
```

### Dashboard Professor - `/teacher/*`

```
RootLayout (ThemeProvider)
  ↓
TeacherLayout (TeacherThemeProvider)
  ↓
Carrega: User.landingTheme
  ↓
CSS vars setadas com cores personalizadas
```

### Landing Page do Professor - `/teacher/landing`

```
TeacherThemeProvider
  ↓
Carrega: User.landingTheme
  ↓
Preview com tema do professor
```

### Landing Preview - `/landing-preview`

```
ThemeProvider + TeacherThemeProvider
  ↓
Carrega: User.landingTheme
  ↓
Exibe landing page com tema professor
```

## ⚠️ Problemas Identificados

1. **Atualizações em tempo real**: Mudanças de tema não refletem instantaneamente
2. **Sincronização**: Cache pode estar desatualizado
3. **Responsividade**: Layouts não otimizados para mobile
4. **Acessibilidade**: Tipografia e contraste inadequados

## ✅ Soluções a Implementar

### Fase 1: Melhorar Sincronização

- [ ] Implementar invalidação de cache após salvar
- [ ] Adicionar polling mais inteligente
- [ ] Usar websockets para sincronização real-time

### Fase 2: Responsive Design

- [ ] Auditar breakpoints (xs, sm, md, lg, xl)
- [ ] Melhorar tipografia mobile (font-sizes menores)
- [ ] Ajustar paddings/margins para telas pequenas
- [ ] Otimizar grid layouts

### Fase 3: Acessibilidade

- [ ] Aumentar contraste (WCAG AA)
- [ ] Melhorar tamanhos de cliques (min 44x44px)
- [ ] Adicionar aria-labels
- [ ] Teste de navegação por teclado

### Fase 4: Performance

- [ ] Code splitting
- [ ] Image optimization
- [ ] Lazy loading de components
- [ ] Compressão de assets
