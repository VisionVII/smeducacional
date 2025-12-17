# 🚀 Guia Rápido - SM Educa (Novos Recursos)

## ⚡ Acesso Rápido

### 👤 Upload de Avatar (Admin)

```
URL: /admin/profile
Role: ADMIN
Recursos:
- Upload de foto (JPG, PNG, WEBP)
- Máximo 5MB
- Preview em tempo real
- Design 100% responsivo
```

### 📊 Dashboard Analytics (Novo!)

```
URL: /admin/analytics
Role: ADMIN
Gráficos:
✅ Novos usuários (7 dias) - AreaChart
✅ Receita diária (7 dias) - LineChart
✅ Distribuição de usuários - PieChart
✅ Top 5 cursos - BarChart
✅ Dados em tempo real
```

### 🗄️ Dashboard Técnico (Original)

```
URL: /admin/dashboard
Role: ADMIN
Informações:
- Diagnóstico do banco
- Métricas de desenvolvedor
- System logs
- Status de pagamentos
```

---

## 🎨 Componentes de Gráficos Disponíveis

### Importação:

```tsx
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  MultiBarChartComponent,
  MultiLineChartComponent,
} from '@/components/admin/chart-components';
```

### Exemplo de Uso:

```tsx
<AreaChartComponent
  data={[
    { name: 'Jan', value: 100 },
    { name: 'Fev', value: 150 },
    { name: 'Mar', value: 200 },
  ]}
  title="Crescimento Mensal"
  description="Usuários cadastrados"
  height={300}
/>
```

---

## 🔧 Estrutura de Dados

### Para Gráficos Simples:

```typescript
const data = [
  { name: 'Label 1', value: 10 },
  { name: 'Label 2', value: 20 },
];
```

### Para Gráficos Múltiplos:

```typescript
const data = [
  { name: 'Jan', alunos: 50, professores: 10 },
  { name: 'Fev', alunos: 80, professores: 15 },
];

const dataKeys = [
  { key: 'alunos', name: 'Alunos', color: '#3b82f6' },
  { key: 'professores', name: 'Professores', color: '#10b981' },
];
```

---

## 📱 Responsividade

Todos os componentes são **mobile-first**:

- Gráficos: `ResponsiveContainer` (100% width)
- Grids: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Typography: `text-xs sm:text-sm lg:text-base`
- Padding: `px-3 sm:px-6 lg:px-8`
- Botões: `w-full sm:w-auto`

---

## 🎯 Paleta de Cores (Gráficos)

```javascript
COLORS = {
  primary: 'hsl(var(--primary))', // Azul tema
  success: '#10b981', // Verde
  warning: '#f59e0b', // Amarelo
  danger: '#ef4444', // Vermelho
  info: '#3b82f6', // Azul claro
  purple: '#8b5cf6', // Roxo
  pink: '#ec4899', // Rosa
};
```

---

## ✅ Checklist Pós-Deploy

Após fazer deploy, teste:

- [ ] Login como admin funciona
- [ ] Upload de avatar em `/admin/profile`
- [ ] Dashboard analytics carrega corretamente
- [ ] Gráficos são interativos (hover)
- [ ] Responsividade mobile
- [ ] Dados em tempo real
- [ ] Performance (< 3s load time)

---

## 🆘 Troubleshooting

### Avatar não sobe?

1. Verificar permissões da pasta `/public/uploads/avatars/`
2. Verificar role do usuário (deve ser ADMIN)
3. Verificar tipo e tamanho do arquivo

### Gráficos não aparecem?

1. Verificar se Recharts está instalado (`npm list recharts`)
2. Verificar dados retornados (deve ser array)
3. Abrir console do navegador para erros

### Dashboard lento?

1. Verificar queries Prisma (usar `$transaction`)
2. Adicionar indexes no banco
3. Implementar cache (Redis/Vercel KV)

---

**Desenvolvido com ❤️ pela equipe SM Educa**
