# 🚀 Dashboard Administrativo V3 - SM Educa

## Visão Geral

Sistema completo de dashboard administrativo moderno, escalável e totalmente responsivo para o SM Educa. Construído com as melhores práticas de **Clean Architecture**, **Mobile-First Design** e **Performance-Oriented Development**.

---

## ✨ Características Principais

### 🎯 Design System Moderno

- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Componentes Modulares**: Sistema de widgets reutilizáveis e independentes
- **Navegação Hierárquica**: Sidebar com menus colapsáveis e submenu aninhados
- **Responsividade Total**: Breakpoints otimizados (mobile, tablet, desktop, ultrawide)
- **Dark Mode**: Suporte completo a temas claro/escuro

### 📊 Widgets e Componentes

1. **QuickStats** - 4 cards de estatísticas rápidas

   - Total de Usuários (com crescimento em 30 dias)
   - Cursos Ativos
   - Matrículas (com crescimento em 7 dias)
   - Receita Total

2. **RevenueChart** - Gráfico de barras de receita (7 dias)

   - TanStack Query com auto-refresh (60s)
   - Recharts com tooltips customizados
   - Formatação monetária PT-BR

3. **UserGrowthChart** - Gráfico de área de crescimento de usuários

   - Gradient fill animado
   - Data formatting com date-fns/ptBR
   - Responsivo com ResponsiveContainer

4. **RecentActivityFeed** - Feed unificado de atividades

   - Novos usuários + Novas matrículas
   - Avatares com fallback para iniciais
   - Badges coloridos por tipo
   - Timestamps formatados

5. **TopCoursesWidget** - Top 5 cursos mais populares

   - Thumbnails com fallback
   - Contadores de alunos
   - Links diretos para gestão

6. **QuickActionsPanel** - Ações rápidas administrativas

   - 5 ações principais (Novo Curso, Usuários, Cursos, Config, Relatórios)
   - Ícones Lucide com cores diferenciadas

7. **SystemHealthWidget** - Monitoramento de saúde do sistema
   - Status: Saudável / Atenção / Crítico
   - Contadores de erros (24h)
   - Usuários ativos (24h)
   - Link para logs quando há erros

### 🧭 Navegação e Layout

#### AdminHeader (Header Superior)

- Logo do sistema
- Barra de busca global (desktop)
- Notificações com badge de contagem
- Menu mobile (Sheet/Drawer)
- UserNav com dropdown

#### AdminSidebar (Navegação Lateral)

- 11 itens principais de menu:

  1. Dashboard
  2. Usuários (com submenu: Todos, Alunos, Professores, Admins)
  3. Cursos (com submenu: Todos, Novo, Categorias)
  4. Matrículas
  5. Financeiro (com submenu: Pagamentos, Assinaturas, Relatórios)
  6. Analytics
  7. Mensagens (com badge de notificações)
  8. Notificações
  9. Relatórios (com submenu: Geral, Acessos, Certificados)
  10. Segurança
  11. Configurações

- **Collapsible Components**: Menus expandem/colapsam suavemente
- **Active States**: Indicação visual de rota ativa
- **Icons**: Lucide React icons para cada item
- **Badges**: Notificações e contadores inline

---

## 🏗️ Arquitetura do Sistema

### Estrutura de Arquivos

```
src/
├── app/
│   ├── admin/
│   │   └── dashboard-v3/
│   │       └── page.tsx                     # Página principal do dashboard
│   └── api/
│       └── admin/
│           └── charts/
│               ├── revenue/route.ts         # API de dados de receita
│               └── user-growth/route.ts     # API de crescimento de usuários
├── components/
│   ├── admin/
│   │   ├── admin-header.tsx                 # Header global
│   │   ├── admin-sidebar.tsx                # Sidebar de navegação
│   │   └── dashboard/
│   │       ├── dashboard-shell.tsx          # Container principal
│   │       ├── dashboard-header.tsx         # Header do dashboard
│   │       ├── quick-stats.tsx              # Cards de estatísticas
│   │       ├── revenue-chart.tsx            # Gráfico de receita
│   │       ├── user-growth-chart.tsx        # Gráfico de usuários
│   │       ├── recent-activity-feed.tsx     # Feed de atividades
│   │       ├── top-courses-widget.tsx       # Widget de top cursos
│   │       ├── quick-actions-panel.tsx      # Painel de ações rápidas
│   │       └── system-health-widget.tsx     # Widget de saúde do sistema
│   └── ui/
│       ├── collapsible.tsx                  # Radix UI Collapsible
│       └── sheet.tsx                        # Radix UI Sheet (mobile drawer)
```

### Fluxo de Dados

```
Server Component (Dashboard V3)
  ↓
Promise.all() - Queries Prisma paralelas
  ↓
Props → Componentes Server-Side (QuickStats, RecentActivityFeed, TopCourses, SystemHealth)
  ↓
Render inicial com dados reais

Client Components (Charts)
  ↓
TanStack Query → API Routes (/api/admin/charts/*)
  ↓
RefetchInterval: 60s (auto-refresh)
  ↓
Recharts rendering com ResponsiveContainer
```

---

## 🎨 Design Patterns Implementados

### 1. Mobile-First Responsive Design

```tsx
// Exemplo de grid responsivo
<div className="grid gap-4 md:gap-6 lg:gap-8">
  {/* 1 coluna mobile → 2 colunas tablet → 4 colunas desktop */}
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <QuickStats />
  </div>

  {/* 1 coluna mobile → 2 colunas desktop */}
  <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
    <RevenueChart />
    <UserGrowthChart />
  </div>

  {/* 1 coluna mobile → 3 colunas desktop (2+1) */}
  <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <RecentActivityFeed />
    </div>
    <div>
      <TopCoursesWidget />
      <QuickActionsPanel />
      <SystemHealthWidget />
    </div>
  </div>
</div>
```

### 2. Server-Side Data Fetching com Suspense

```tsx
export default async function AdminDashboardV3() {
  const data = await getDashboardData(); // Server-side apenas

  return (
    <DashboardShell>
      <QuickStats stats={data.stats} />

      <Suspense fallback={<LoadingSkeleton />}>
        <RevenueChart />
      </Suspense>
    </DashboardShell>
  );
}
```

### 3. Client-Side Data Fetching com TanStack Query

```tsx
'use client';

export function RevenueChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: async () => {
      const res = await fetch('/api/admin/charts/revenue');
      return res.json();
    },
    refetchInterval: 60000, // Atualiza a cada 60s
  });

  return <BarChart data={data} />;
}
```

### 4. API Routes com Autenticação RBAC

```tsx
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  // Query Prisma com agregação
  const data = await prisma.payment.aggregate({
    where: { status: 'completed' },
    _sum: { amount: true },
  });

  return NextResponse.json(data);
}
```

---

## 🚀 Como Usar

### 1. Acesso ao Dashboard V3

Navegue para: **`/admin/dashboard-v3`**

### 2. Navegação Lateral

- **Desktop**: Sidebar fixa à esquerda
- **Mobile**: Hamburger menu (Sheet drawer)

### 3. Widgets Auto-Refresh

Os gráficos atualizam automaticamente a cada **60 segundos** via TanStack Query.

### 4. Dark Mode

O tema é sincronizado automaticamente com a preferência do usuário (next-themes).

---

## 📱 Breakpoints Responsivos

| Breakpoint  | Width   | Layout                              |
| ----------- | ------- | ----------------------------------- |
| `mobile`    | < 768px | 1 coluna, stacked widgets           |
| `tablet`    | 768px+  | 2 colunas, sidebar fixa             |
| `desktop`   | 1024px+ | 3-4 colunas, grid layout completo   |
| `ultrawide` | 1600px+ | Máximo 1600px de largura (centered) |

---

## 🔧 Customização e Extensibilidade

### Adicionar Novo Widget

1. Crie o componente em `src/components/admin/dashboard/my-widget.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MyWidget({ data }: { data: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Widget</CardTitle>
      </CardHeader>
      <CardContent>{/* Seu conteúdo aqui */}</CardContent>
    </Card>
  );
}
```

2. Importe e adicione ao grid em `dashboard-v3/page.tsx`:

```tsx
import { MyWidget } from '@/components/admin/dashboard/my-widget';

export default async function AdminDashboardV3() {
  return (
    <DashboardShell>
      {/* ... outros widgets */}
      <MyWidget data={myData} />
    </DashboardShell>
  );
}
```

### Adicionar Nova Rota na Sidebar

Edite `src/components/admin/admin-sidebar.tsx`:

```tsx
const navItems: NavItem[] = [
  // ... itens existentes
  {
    title: 'Nova Seção',
    href: '/admin/new-section',
    icon: MyIcon,
    badge: '5', // opcional
    children: [
      // submenu opcional
      { title: 'Sub-item 1', href: '/admin/new-section/sub1' },
      { title: 'Sub-item 2', href: '/admin/new-section/sub2' },
    ],
  },
];
```

---

## ⚡ Performance e Otimizações

### 1. Queries Prisma Paralelas

```tsx
const [stats, activity, courses] = await Promise.all([
  prisma.$transaction([
    /* queries simultâneas */
  ]),
  prisma.user.findMany(),
  prisma.course.findMany(),
]);
```

### 2. Server Components por Padrão

- Reduz bundle JavaScript no cliente
- SSR com dados reais no primeiro render
- Client Components apenas para interatividade (charts, forms)

### 3. TanStack Query Cache

- Dados em cache para evitar re-fetches desnecessários
- Revalidação inteligente com staleTime/gcTime
- Optimistic updates preparados

### 4. Image Optimization

```tsx
<Image
  src={thumbnail}
  alt={title}
  fill
  className="object-cover"
  // Next.js automaticamente otimiza
/>
```

---

## 🔒 Segurança

### 1. Middleware RBAC

```typescript
// src/middleware.ts valida todas as rotas /admin/*
if (pathname.startsWith('/admin') && session.user.role !== 'ADMIN') {
  return NextResponse.redirect(new URL('/login', req.url));
}
```

### 2. API Routes Protegidas

```typescript
const session = await auth();
if (!session?.user || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}
```

### 3. Zod Validation

```typescript
const schema = z.object({
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed']),
});
```

---

## 📊 Métricas e Analytics

O dashboard V3 rastreia:

- ✅ Total de usuários + crescimento em 30 dias
- ✅ Total de cursos ativos
- ✅ Total de matrículas + crescimento em 7 dias
- ✅ Receita total (pagamentos concluídos)
- ✅ Receita diária (últimos 7 dias)
- ✅ Novos usuários diários (últimos 7 dias)
- ✅ Top 5 cursos por matrículas
- ✅ Atividade recente (últimas 10 ações)
- ✅ Erros do sistema (últimas 24h)
- ✅ Usuários ativos (últimas 24h)

---

## 🐛 Troubleshooting

### Problema: Gráficos não carregam

**Solução**: Verifique se as APIs estão acessíveis:

```bash
curl http://localhost:3000/api/admin/charts/revenue
curl http://localhost:3000/api/admin/charts/user-growth
```

### Problema: Sidebar não abre no mobile

**Solução**: Certifique-se de que `@radix-ui/react-dialog` está instalado:

```bash
npm install @radix-ui/react-dialog
```

### Problema: TypeScript errors em Prisma

**Solução**: Regenere o Prisma Client:

```bash
npm run db:generate
```

---

## 🧪 Testes

### Teste Manual - Mobile Responsiveness

1. Abra DevTools (F12)
2. Ative Device Toolbar (Ctrl+Shift+M)
3. Teste nos perfis:
   - iPhone SE (375px)
   - iPad (768px)
   - Desktop (1920px)

### Teste Manual - Dark Mode

1. Clique no toggle de tema no header
2. Verifique que todos os componentes atualizam corretamente

### Teste Manual - Auto-refresh

1. Abra Network tab no DevTools
2. Aguarde 60 segundos
3. Verifique requests automáticos para `/api/admin/charts/*`

---

## 📚 Dependências Principais

```json
{
  "dependencies": {
    "next": "16.0.10",
    "react": "18.3.1",
    "@tanstack/react-query": "^5.x",
    "recharts": "2.15.4",
    "date-fns": "^4.1.0",
    "@radix-ui/react-collapsible": "^1.x",
    "@radix-ui/react-dialog": "^1.x",
    "lucide-react": "^0.x",
    "zod": "^3.x",
    "@prisma/client": "5.22.0"
  }
}
```

---

## 🗺️ Roadmap

### Fase 2 (Próximas Features)

- [ ] Drag-and-drop de widgets (react-grid-layout)
- [ ] Exportar relatórios em PDF/Excel
- [ ] Notificações push em tempo real (WebSockets)
- [ ] Dashboard personalizável por usuário (salvar layouts no banco)
- [ ] Modo de comparação de períodos (7 dias vs 30 dias)
- [ ] Alertas e webhooks configuráveis
- [ ] Integração com Google Analytics

### Fase 3 (Enterprise Features)

- [ ] Multi-tenancy (subdomínios por instituição)
- [ ] White-label completo
- [ ] Audit logs detalhados
- [ ] RBAC granular (permissões customizadas)
- [ ] API GraphQL para integrações externas

---

## 👨‍💻 Desenvolvido por

**VisionVII** — Transformando educação através da tecnologia

🌐 [www.visionvii.com](https://www.visionvii.com)  
📧 contato@visionvii.com  
📍 Brasil, 2025

---

## 📄 Licença

Proprietary Software - SM Educa  
© 2025 VisionVII. Todos os direitos reservados.

---

**✨ Dashboard V3 está pronto para produção! Acesse `/admin/dashboard-v3` e explore todas as funcionalidades.**
