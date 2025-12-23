# 🎨 Sistema Avançado de Edição de Páginas Públicas - SM Educa

## 📋 Visão Geral

Sistema **Elementor-style** completo para edição visual de páginas públicas com estrutura totalmente editável, templates pré-definidos e mapa de estrutura em tempo real.

---

## ✨ Funcionalidades Implementadas

### 1. **Templates Pré-Definidos** 🎭

Criados 5 templates profissionais prontos para uso:

#### 🏠 **Home Template**

- Hero banner com imagem + CTA
- Seção de benefícios com lista
- Seção final de CTA
- Ideal para: Landing page, página inicial

#### 👥 **About Template**

- Hero institucional
- Missão e valores
- Estrutura para apresentação da empresa
- Ideal para: Sobre nós, quem somos

#### 📧 **Contact Template**

- Informações de contato estruturadas
- Lista de canais de comunicação
- Botão de ação
- Ideal para: Fale conosco, contato

#### ❓ **FAQ Template**

- Estrutura de perguntas e respostas
- Seções organizadas por categoria
- Expansível
- Ideal para: Dúvidas frequentes, ajuda

#### 📄 **Blank Template**

- Página em branco
- Totalmente personalizável
- Para criação livre
- Ideal para: Páginas custom, testes

### 2. **Visualização de Estrutura ao Hover** 👁️

#### Overlay Interativo

Ao passar o mouse sobre qualquer bloco, exibe:

- **Badge colorido** com tipo e número do bloco
- **Preview do conteúdo** (texto, URL, número de itens, etc.)
- **Toolbar de ações** (editar, duplicar, deletar, mover)
- **Indicador de blocos internos** (para seções)

#### Cores por Tipo de Bloco

- 🔵 **Texto**: Azul
- 🟣 **Imagem**: Roxo
- 🟢 **Botão**: Verde
- 🟠 **Lista**: Laranja
- 🔴 **Vídeo**: Vermelho
- 🟣 **Seção**: Indigo

### 3. **Mapa de Estrutura** 🗺️

Sidebar lateral direita (toggle) mostrando:

- Hierarquia completa da página
- Tipo e número de cada bloco
- Preview compacto do conteúdo
- Blocos internos de seções (árvore visual)
- Clique para selecionar/editar bloco

### 4. **Toolbar de Blocos Flutuante** 🛠️

Barra fixa no bottom da tela com botões para adicionar:

- ✍️ Texto
- 🖼️ Imagem
- 🔘 Botão
- 📝 Lista
- 🎥 Vídeo
- 📦 Seção

### 5. **Ações em Bloco** ⚡

Cada bloco possui ações rápidas:

- ✏️ **Editar**: Abre dialog de edição
- 📋 **Duplicar**: Cria cópia do bloco
- 🗑️ **Deletar**: Remove bloco (com confirmação)
- ⬆️ **Mover para cima**: Reordena na lista
- ⬇️ **Mover para baixo**: Reordena na lista

### 6. **Edição Inline Completa** 🎯

- **Header editável** (título, descrição, banner, ícone)
- **Blocos editáveis** (todos os tipos)
- **Preview em tempo real** (draft não afeta publicado)
- **Auto-save** de draft (não salva automaticamente no banco)

### 7. **Rascunho vs Publicado** 📝

- ✅ Todas alterações são **draft** até salvar
- ✅ Página publicada **não é afetada** durante edição
- ✅ Botão "Salvar" confirma mudanças
- ✅ Indicador visual de status (rascunho/publicada)

---

## 📁 Arquivos Criados/Modificados

### **Novos Arquivos**

#### 1. `/src/lib/page-templates.ts`

```typescript
- homeTemplate: Template da home com hero + benefícios + CTA
- aboutTemplate: Template institucional com missão/valores
- contactTemplate: Template de contato com informações
- faqTemplate: Template de FAQ com Q&A
- blankTemplate: Página em branco
- PAGE_TEMPLATES: Record com todos os templates
- TEMPLATE_LIST: Array para seleção
- getTemplateBySlug(): Helper para obter template
```

#### 2. `/src/components/admin/BlockStructureOverlay.tsx`

```typescript
- BlockStructureOverlay: Overlay visual ao hover
  - Badge com tipo/número
  - Preview de conteúdo
  - Toolbar de ações (editar, duplicar, deletar, mover)
  - Cores por tipo de bloco

- PageStructureMap: Mapa de estrutura (sidebar)
  - Hierarquia completa
  - Árvore visual de seções
  - Seleção de blocos
  - Scroll sync
```

### **Arquivos Modificados**

#### 3. `/src/components/admin/PublicPagesDashboard.tsx`

```typescript
Adicionado:
- showTemplateDialog: Dialog de seleção de template
- showStructureMap: Toggle do mapa de estrutura
- hoveredBlockIndex: Controle de hover
- handleCreateFromTemplate(): Carrega template escolhido
- handleDuplicateBlock(): Duplica bloco
- handleDeleteBlock(): Remove bloco
- handleMoveBlockUp(): Move bloco para cima
- handleMoveBlockDown(): Move bloco para baixo
- handleAddBlock(): Adiciona novo bloco por tipo

Layout atualizado:
- 3 colunas: Sidebar (páginas) | Editor | Mapa de estrutura
- BlockStructureOverlay em cada bloco
- Toolbar flutuante de blocos
- Dialog de templates com grid visual
- Toggle para mostrar/ocultar estrutura
```

---

## 🚀 Como Usar

### **1. Criar Nova Página com Template**

1. Clique em "Nova Página"
2. Escolha um template no dialog
3. Template é carregado com blocos pré-definidos
4. Personalize título, slug e conteúdo
5. Clique em "Salvar"

### **2. Editar Página Existente**

1. Selecione a página na sidebar esquerda
2. Passe o mouse sobre qualquer elemento para ver estrutura
3. Clique em "Editar" no overlay para abrir dialog
4. Ou use toolbar flutuante para adicionar novos blocos
5. Clique em "Salvar" para confirmar

### **3. Visualizar Estrutura**

1. Clique em "Mostrar Estrutura" no toolbar
2. Sidebar direita abre com mapa completo
3. Clique em qualquer bloco no mapa para editar
4. Veja hierarquia visual de seções

### **4. Reorganizar Blocos**

1. Passe o mouse sobre bloco
2. Use botões ⬆️ ⬇️ no overlay
3. Ou arraste (futuro)

### **5. Duplicar/Deletar Blocos**

1. Hover sobre bloco
2. Clique em 📋 (duplicar) ou 🗑️ (deletar)
3. Ações instantâneas com feedback visual

---

## 🎨 Design System

### **Cores dos Blocos** (ao hover)

```
Texto    → Azul (#3B82F6)
Imagem   → Roxo (#A855F7)
Botão    → Verde (#10B981)
Lista    → Laranja (#F97316)
Vídeo    → Vermelho (#EF4444)
Seção    → Indigo (#6366F1)
```

### **Espaçamento**

- Padding dos blocos: `1.5rem` (6)
- Gap entre blocos: `1.5rem` (6)
- Overlay border: `2px`
- Toolbar buttons: `0.5rem` gap

### **Animações**

- Hover transition: `200ms`
- Border color transition
- Shadow on hover
- Opacity fade in/out

---

## 🔗 Conexão com Rotas Públicas

### **Rotas Dinâmicas**

```typescript
/[slug]          → Renderiza PublicPage (isPublished = true)
/public/[slug]   → Mesma lógica
```

### **Integração**

1. Página criada na dashboard
2. Slug define a rota (ex: `home` → `/home`)
3. isPublished controla visibilidade
4. Content é renderizado via BlockRenderer
5. SEO metadata automática

### **Preview Live**

- Botão "Ver Publicada" abre em nova aba
- Preview real da página (se publicada)
- Draft não afeta preview

---

## 📊 Fluxo de Dados

```
Template Selecionado
  ↓
Carga de Blocos Pré-Definidos
  ↓
formData (draft state)
  ↓
Edições (inline + dialogs)
  ↓
Hover → BlockStructureOverlay
  ↓
Ações → handleSave/Delete/Duplicate/Move
  ↓
Mutation (React Query)
  ↓
API Route (/api/admin/public-pages/[id])
  ↓
Prisma → Database
  ↓
Invalidate Query → Reload
```

---

## 🛡️ Segurança

### **Validação**

- ✅ Zod schema server-side (title, slug, content)
- ✅ Auth check obrigatório (ADMIN role)
- ✅ Validação de tipos de bloco
- ✅ Sanitização de inputs

### **Permissões**

- ❌ Apenas ADMIN pode criar/editar/deletar
- ❌ Rotas protegidas por middleware
- ❌ Session JWT verificada

---

## 🎯 Próximos Passos (Futuro)

### **Fase 2 - Drag & Drop**

- [ ] react-dnd para arrastar blocos
- [ ] Reordenação visual
- [ ] Drop zones entre blocos

### **Fase 3 - Versionamento**

- [ ] Histórico de versões
- [ ] Rollback de mudanças
- [ ] Comparação de versões

### **Fase 4 - Blocos Avançados**

- [ ] Formulários
- [ ] Galerias de imagens
- [ ] Carrossel
- [ ] Accordions/Tabs

### **Fase 5 - Responsividade**

- [ ] Preview mobile/tablet/desktop
- [ ] Breakpoints customizáveis
- [ ] CSS per device

---

## 📚 Dependências

- ✅ React 18+
- ✅ Next.js 16+
- ✅ TanStack Query (mutations)
- ✅ Shadcn/UI (components)
- ✅ Lucide React (icons)
- ✅ Tailwind CSS
- ✅ Prisma (database)
- ✅ Zod (validation)

---

## 🧪 Testes

### **Manual Testing Checklist**

- [ ] Criar página com cada template
- [ ] Editar header (título, descrição, banner, ícone)
- [ ] Adicionar cada tipo de bloco
- [ ] Editar blocos existentes
- [ ] Duplicar blocos
- [ ] Deletar blocos
- [ ] Mover blocos (up/down)
- [ ] Salvar e verificar persistência
- [ ] Publicar e verificar rota pública
- [ ] Toggle mapa de estrutura
- [ ] Hover sobre blocos (overlay)
- [ ] Clicar em blocos no mapa

---

## 🎓 Guia Rápido para Usuário Final

### **Como criar uma Home Page?**

1. Login como ADMIN
2. Vá em `/admin/public-pages`
3. Clique "Nova Página"
4. Selecione template "🏠 Bem-vindo ao SM Educa"
5. Passe mouse sobre banner → clique "Editar"
6. Faça upload do banner
7. Edite título e descrição
8. Personalize seções
9. Clique "Salvar"
10. Toggle "Publicar" ON
11. Acesse `/home` para ver resultado

### **Como editar página existente?**

1. Selecione página na sidebar
2. Passe mouse sobre qualquer elemento
3. Veja estrutura visual (tipo, preview)
4. Clique "Editar" no overlay
5. Modifique no dialog
6. Salve mudanças
7. Clique "Salvar" no topo para persistir

---

## 📝 Notas Técnicas

### **Performance**

- `requestAnimationFrame` para evitar cascading renders
- React Query com cache inteligente
- Lazy loading de blocos
- Debounce em inputs (futuro)

### **Acessibilidade**

- ARIA labels em todos os botões
- Keyboard navigation (Tab)
- Focus indicators
- Screen reader friendly

### **SEO**

- Metadata automática por página
- Slugs SEO-friendly
- Alt texts em imagens
- Títulos hierárquicos (H1, H2, H3)

---

## 🏆 Diferencial Competitivo

### **vs WordPress/Elementor**

- ✅ Integrado nativamente (sem plugins)
- ✅ TypeScript full stack (type safety)
- ✅ React Query (caching otimizado)
- ✅ Tailwind CSS (utility-first)
- ✅ Next.js 16 (performance)

### **vs Webflow**

- ✅ Open source (sem vendor lock-in)
- ✅ Customizável 100%
- ✅ Database própria (Prisma)
- ✅ Deploy on-premise possível

### **vs Notion Pages**

- ✅ Mais controle sobre design
- ✅ SEO-friendly completo
- ✅ Custom routing
- ✅ Integração com sistema escolar

---

**Desenvolvido com excelência pela VisionVII** 🚀  
Sistema educacional moderno com CMS avançado integrado.
