# 🎬 Página de Catálogo de Cursos com Carousel Promocional

## Visão Geral

A página de catálogo de cursos agora possui uma **"primeira camada"** interativa com carousel de cursos promovidos, projetada para funcionar tanto em **mobile** quanto em **desktop**.

### Layouts por Dispositivo

#### 📱 Mobile (< 768px)
- **Estilo Shorts (TikTok/Instagram Reels)**
- Layout vertical ocupando a altura da tela
- Indicadores de progresso na parte superior (barras que mostram qual short está sendo visualizado)
- Informações do curso na parte inferior sobre fundo degradado
- Deslizamento automático a cada 5 segundos
- Interação: toque nos indicadores para pular para o slide desejado

#### 🖥️ Desktop (≥ 768px)
- **Estilo Paisagem (Video em Landscape)**
- Carrossel horizontal em modo `slideshow`
- Conteúdo do curso à esquerda com fade-out
- Controles de navegação (setas) na parte inferior direita
- Indicadores de pontos na parte inferior esquerda
- Deslizamento automático a cada 5 segundos
- Interação: clique nas setas ou nos indicadores para navegar

---

## Como Usar

### 1️⃣ No Painel Admin - Selecionar Cursos Promocionados

#### Acesso
1. Navegue para **Painel Admin** → **Conteúdo Educacional** (Cursos)
2. Clique no botão **"⭐ Promover Cursos"** no topo da página

#### Seleção de Cursos
1. A modal **"Gerenciar Cursos Promovidos"** abre com lista de todos os cursos
2. Marque o checkbox dos cursos que deseja promover
3. Um ícone de estrela ⭐ aparece ao lado dos cursos selecionados
4. Cada clique no checkbox atualiza o status automaticamente

#### Recomendações
- **Máximo recomendado:** 5 cursos
- Quanto mais cursos selecionados, mais rápido o carrossel passa por cada um
- Selecione seus melhores cursos para maximizar engajamento

### 2️⃣ Visualizar na Página Pública

#### URL
```
https://seu-dominio.com/courses
```

#### Comportamento Automático
- Os cursos marcados como promovidos aparcem **automaticamente** na primeira camada (carousel no topo)
- Atualiza em tempo real quando você muda as seleções no admin

---

## Arquitetura Técnica

### Banco de Dados
```sql
-- Campos adicionados ao modelo Course
isFeatured    Boolean  @default(false)    -- Marca se está promovido
featuredAt    DateTime?                   -- Timestamp da promoção
```

### APIs

#### 1. Buscar Cursos Promovidos
```
GET /api/courses/featured
```
**Resposta:**
```json
[
  {
    "id": "curso-id",
    "title": "Título do Curso",
    "slug": "titulo-do-curso",
    "description": "Descrição...",
    "thumbnail": "https://...",
    "duration": 40,
    "level": "Intermediário",
    "price": 99.99,
    "isPaid": true,
    "instructor": {
      "name": "Nome do Instrutor",
      "avatar": "https://..."
    },
    "_count": {
      "enrollments": 1234
    }
  }
]
```

#### 2. Atualizar Status de Promoção (Admin)
```
PUT /api/admin/courses/{courseId}/featured
```
**Body:**
```json
{
  "isFeatured": true
}
```

**Resposta:**
```json
{
  "data": { /* Course object */ },
  "message": "Curso promovido com sucesso"
}
```

---

## Componentes React

### 1. `CoursesCarousel` 
**Arquivo:** `src/components/courses-carousel.tsx`

Props:
```typescript
interface CoursesCarouselProps {
  courses: Course[];  // Array de cursos a exibir
}
```

Funcionalidades:
- Auto-play a cada 5 segundos
- Detecta automaticamente Mobile vs Desktop
- Controles de navegação responsivos
- Indicadores de progresso/slides

### 2. `ManageFeaturedCoursesModal`
**Arquivo:** `src/components/manage-featured-courses-modal.tsx`

Props:
```typescript
interface ManageFeaturedCoursesModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
}
```

Funcionalidades:
- Modal para seleção de cursos
- Atualizações em tempo real
- Feedback visual (ícone de estrela)
- Contagem de seleções com aviso de limite

---

## Estilos & Animações

### Carousel Mobile
```css
/* Altura máxima de 600px no mobile */
h-screen max-h-[600px]

/* Indicadores de progresso no topo */
flex gap-1 → barra branca quando ativa
opacity-100 → fadeIn quando ativa

/* Conteúdo em fundo gradiente */
bg-gradient-to-t from-black via-black/40 to-transparent
```

### Carousel Desktop
```css
/* Altura responsiva */
h-96 lg:h-[500px]

/* Conteúdo lado esquerdo */
max-w-lg space-y-6

/* Botões de navegação com backdrop blur */
bg-white/20 hover:bg-white/30 backdrop-blur-sm
border-none rounded-full
```

### Transições
```css
/* Fade entre slides */
transition-opacity duration-500

/* Escala em hover */
hover:scale-105 transition-transform duration-300

/* Botões com glow effect */
hover:shadow-lg hover:shadow-primary/50
```

---

## Fluxo de Dados

```mermaid
Admin Admin Dashboard
  ↓
Click "⭐ Promover Cursos"
  ↓
Modal com lista de cursos
  ↓
Selecionar/desselecionar (checkbox)
  ↓
PUT /api/admin/courses/{id}/featured
  ↓
Prisma atualiza isFeatured + featuredAt
  ↓
⚡ Invalidar queries (TanStack Query)
  ↓
Atualizar estado local do modal
  ↓
Toast de sucesso/erro
  ↓
🌍 Página pública (Catálogo)
  ↓
GET /api/courses/featured
  ↓
<CoursesCarousel courses={featuredCourses} />
  ↓
📱 Render Mobile ou 🖥️ Render Desktop
```

---

## Casos de Uso

### Cenário 1: Lançar Novo Curso Premium
1. Instrutor cria o curso
2. Admin aprova e publica
3. Admin promove via modal
4. Aparece no topo da página de catálogo
5. Aumenta visibilidade e conversão

### Cenário 2: Campanha Sazonal
1. Admin seleciona 3-5 cursos sazonais
2. Carousel destaca durante a campanha
3. Após campanha, remove do destaque
4. Volta para exibição normal

### Cenário 3: Cursos com Melhor Performance
1. Analisar dados de engajamento
2. Selecionar top performers
3. Manter no destaque como "recomendados"
4. Aumenta taxa de conversão

---

## Performance

- **Lazy Loading:** Imagens carregadas apenas quando slide está ativo
- **Auto-play:** Para quando usuário interage com controles
- **Mobile Detection:** Uma única execução ao mount
- **Query Caching:** TanStack Query invalida apenas quando necessário
- **CSS-in-JS:** Keyframes definidas inline (sem extra requests)

---

## Acessibilidade

- ✅ Labels ARIA em botões de navegação
- ✅ Contraste suficiente em textos/fundos
- ✅ Indicadores de slides visualmente distintos
- ✅ Deslizamento automático pode ser pausado com interação

---

## Troubleshooting

### Carousel não aparece
- Verifique se há cursos com `isFeatured = true`
- Confirme que os cursos têm `isPublished = true`
- Check API response: `GET /api/courses/featured`

### Slides não trocam automaticamente
- Verifique se `isAutoPlay` está `true`
- Confirme que o intervalo de 5 segundos não foi alterado
- Interação com controles pausa auto-play

### Modal não salva seleções
- Verifique permissões do usuário (ADMIN only)
- Confirme conexão com banco de dados
- Check browser console para erros de API

### Design quebrado em resoluções específicas
- Testou em breakpoints: sm (640px), md (768px), lg (1024px)?
- Verifique Tailwind config em `tailwind.config.ts`
- Use `next/image` para otimização

---

## Próximos Passos (Sugestões)

### ✨ Futuras Melhorias
1. **Ordem customizável:** Drag-and-drop para reordenar cursos no destaque
2. **Agendamento:** Agendar promoções para datas específicas
3. **Analytics:** Tracking de cliques no carousel
4. **A/B Testing:** Testar diferentes combinações de cursos
5. **Filtros:** Agrupar por categoria/instrutor no destaque
6. **Video Preview:** Play preview de 15s do primeiro vídeo do curso

---

## Desenvolvido com Excelência pela **VisionVII**
Uma empresa focada em desenvolvimento de software, inovação tecnológica e transformação digital.  
Nossa missão é criar soluções que impactam positivamente pessoas e empresas através da tecnologia.
