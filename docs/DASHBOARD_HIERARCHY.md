# 🏗️ Arquitetura de Dashboards - VisionVII

## Hierarquia de Usuários e Acesso

```
ADMIN (Superusuário)
├── Acesso a tudo
├── Dashboard Financeiro Global
├── Painel de Segurança
└── Gerenciamento de Usuários

PROFESSOR (Creator)
├── Dashboard Pessoal
├── Gerenciamento de Cursos
├── Relatórios de Alunos
├── Pagamentos Recebidos
└── Análise de Anúncios

ALUNO (Learner)
├── Dashboard Pessoal
├── Meus Cursos
├── Progresso de Aprendizado
├── Certificados
└── Preferências de Anúncios
```

---

## 📊 1. Dashboard Admin (`/admin/dashboard`)

**Descrição:** Painel de controle da plataforma com visão completa de todas as operações.

### Seções Principais:

#### 1.1 **Visão Geral**

- Usuários totais (Alunos + Professores)
- Cursos ativos
- Receita total
- Anúncios exibidos
- Taxa de atividade

#### 1.2 **Gerenciamento Financeiro**

- 💰 **Receita por Fonte:**

  - Pagamentos de alunos → Professores
  - Pagamentos de professores → Admin (planos premium)
  - Receita de anúncios (CPM, CPC)

- 💳 **Transações Recentes**

  - Quem pagou (aluno/professor)
  - Para quem (professor/admin)
  - Valor e data
  - Status (pendente, processado, falho)

- 📈 **Relatório de Receita**
  - Por período (diário, mensal, anual)
  - Por tipo de transação
  - Distribuição: 30% Admin | 40% Professor | 30% Plataforma

#### 1.3 **Gerenciamento de Anúncios**

- 📺 **Campanha de Anúncios**

  - Anúncios ativos
  - Impressões totais
  - Cliques totais
  - Taxa de conversão
  - CPM/CPC histórico

- 🎯 **Placements Estratégicos**

  - Video Pre-Roll
  - Video Mid-Roll
  - Sidebar Banners
  - Course Headers
  - Dashboard Widgets

- 🚫 **Bloqueio de Anúncios por Plano**
  - Free: COM anúncios
  - Premium: SEM anúncios
  - Contagem de usuários premium (bloqueio de receita)

#### 1.4 **Usuários e Segurança**

- 👥 **Gerenciamento de Usuários**

  - Listar todos (com filtros)
  - Ativar/desativar conta
  - Verificar atividade suspeita
  - Aprovar/rejeitar professores

- 🔒 **Logs de Segurança**
  - Tentativas de login falhas
  - Acessos não autorizados
  - Mudanças de dados
  - Atividades administrativas

#### 1.5 **Conformidade Legal**

- ✅ **LGPD & Cookies**
  - Solicitações de exclusão de dados
  - Consentimento de usuários
  - Relatórios de processamento

#### 1.6 **Analytics Avançado**

- 📊 Cursos mais populares
- 📊 Professores com mais alunos
- 📊 Taxa de conclusão por curso
- 📊 Tempo médio de aprendizado

---

## 👨‍🏫 2. Dashboard Professor (`/teacher/dashboard`)

**Descrição:** Painel de gerenciamento de cursos e receita do professor.

### Seções Principais:

#### 2.1 **Resumo Financeiro**

- 💰 **Receita Pessoal**

  - Total ganho com alunos
  - Pagamentos recebidos
  - Pendentes
  - Saldo disponível para saque

- 📊 **Distribuição de Receita**

  - Quanto recebi por aluno
  - Quanto a plataforma reteve
  - Histórico de pagamentos

- 🎁 **Plano Atual**
  - Tipo de plano (Free/Premium)
  - Custo mensal (se premium)
  - Anúncios exibidos (se free)
  - Data de renovação

#### 2.2 **Gerenciamento de Cursos**

- 📚 **Meus Cursos**

  - Criar novo curso
  - Editar curso existente
  - Publicar/despublicar
  - Deletar

- 👥 **Alunos por Curso**
  - Listar inscritos
  - Ver progresso individual
  - Enviar mensagens
  - Gerar certificados

#### 2.3 **Análise de Desempenho**

- 📈 **Estatísticas por Curso**

  - Alunos matriculados
  - Alunos ativos
  - Taxa de conclusão
  - Avaliação média
  - Tempo médio de conclusão

- 🎯 **Conversão & Receita**
  - Quantos alunos pagaram
  - Valor médio por aluno
  - Taxa de conversão
  - Tendências

#### 2.4 **Anúncios & Bloqueio**

- 🚫 **Status de Anúncios**

  - Anúncios exibidos em meus vídeos (se plano free)
  - Receita gerada por anúncios
  - Opção para upgrade para Premium

- ⭐ **Upgrade para Premium**
  - Preço mensal
  - Benefícios (sem anúncios)
  - Botão de upgrade direto

#### 2.5 **Comunicação com Alunos**

- 💬 **Mensagens**
  - Inbox com mensagens de alunos
  - Enviar notificações
  - Sugestões e dúvidas

---

## 👨‍🎓 3. Dashboard Aluno (`/student/dashboard`)

**Descrição:** Painel de aprendizado pessoal do aluno.

### Seções Principais:

#### 3.1 **Meus Cursos**

- 📚 **Cursos Inscritos**

  - Listar cursos ativos
  - Barra de progresso
  - Continuar curso (botão rápido)
  - Remover curso

- 📊 **Progresso**
  - % de conclusão
  - Aulas assistidas / total
  - Atividades entregues
  - Tempo gasto

#### 3.2 **Aprendizado**

- 🎓 **Certificados**

  - Cursos concluídos
  - Certificados disponíveis para download
  - Certificado digital com código de verificação
  - Histórico de certificações

- 🏆 **Achievements**
  - Badges conquistados
  - Progresso em rankings
  - Próximos objetivos

#### 3.3 **Anúncios & Plano**

- 📺 **Status de Anúncios**

  - Você está no plano FREE
  - Anúncios aparecerão em vídeos
  - Clique para desativar (se possível)

- ⭐ **Upgrade para Premium**
  - Sem anúncios
  - Acesso exclusivo a conteúdo extra
  - Suporte prioritário
  - Certificados premium

#### 3.4 **Preferências & Privacidade**

- 🍪 **Cookies & Rastreamento**

  - Controlar cookies de anúncios
  - Desativar publicidade personalizada
  - Ver política LGPD

- 🔐 **Segurança da Conta**
  - Mudar senha
  - Ativar 2FA (futura)
  - Excluir conta

#### 3.5 **Notificações**

- 🔔 **Atividades Recentes**
  - Novo conteúdo de curso
  - Feedback do professor
  - Novos cursos recomendados

---

## 💳 4. Fluxo de Pagamentos (Hierarquia Financeira)

```
ALUNO paga PROFESSOR
    ↓
[Stripe processa]
    ↓
PROFESSOR recebe 40% (líquido)
ADMIN recebe 30% (comissão)
PLATAFORMA retém 30% (operação)

---

PROFESSOR paga ADMIN (Plano Premium)
    ↓
[Stripe processa]
    ↓
ADMIN recebe pagamento do plano
PROFESSOR ativa: bloqueio de anúncios
```

---

## 📺 5. Sistema de Anúncios (Estrutura)

### **Onde aparecem:**

1. **Video Pre-Roll (Antes do vídeo)**

   - Duração: 5-10 segundos
   - Saltável após 5s
   - Apenas para plano FREE

2. **Video Mid-Roll (Durante a aula)**

   - Aparece a cada 15 minutos
   - 15-30 segundos
   - Apenas para plano FREE

3. **Sidebar Banner**

   - Lateral direita da página
   - Animado
   - Apenas para plano FREE

4. **Course Header Banner**

   - Topo da página do curso
   - Destaque visual
   - Apenas para plano FREE

5. **Dashboard Widget**
   - Widget promocional
   - Anúncios de planos premium
   - Apenas para plano FREE

### **Desempenho & Receita:**

```
Impressões (visualizações): CPM $2-5 por 1000 impressões
Cliques: CPC $0.50-2 por clique
Conversões: Rastreadas para ROI
```

---

## 🔐 6. Controle de Acesso (RBAC)

```
ADMIN
  ├── /admin/dashboard ✅
  ├── /admin/users ✅
  ├── /admin/payments ✅
  ├── /admin/ads ✅
  ├── /teacher/... ✅
  └── /student/... ✅

TEACHER
  ├── /teacher/dashboard ✅
  ├── /teacher/courses ✅
  ├── /teacher/students ✅
  ├── /student/... ✅
  └── /admin/... ❌

STUDENT
  ├── /student/dashboard ✅
  ├── /student/courses ✅
  ├── /student/certificates ✅
  ├── /teacher/... ❌
  └── /admin/... ❌
```

---

## 📱 7. Dados Exibidos por Dashboard

### **Admin vê:**

- Toda atividade de todos os usuários
- Todas as transações
- Todas as impressões de anúncios
- Logs de segurança completos

### **Professor vê:**

- Apenas seus cursos
- Apenas seus alunos
- Apenas sua receita
- Apenas anúncios em seus vídeos

### **Aluno vê:**

- Apenas seus cursos
- Apenas seu progresso
- Apenas seus certificados
- Apenas suas notificações

---

## 🎯 8. KPIs por Dashboard

### **Admin Dashboard:**

- Receita total (MRR)
- Usuários ativos (DAU/MAU)
- Taxa de conversão (Free → Premium)
- CPM/CPC de anúncios
- Segurança & incidentes

### **Teacher Dashboard:**

- Receita pessoal (MRR)
- Alunos ativos por curso
- Taxa de conclusão
- Anúncios bloqueados (if premium)
- NPS (Net Promoter Score)

### **Student Dashboard:**

- Cursos em progresso
- Progresso % por curso
- Certificados ganhos
- Tempo gasto em aprendizado
- Recomendações personalizadas

---

## 🚀 Próximas Funcionalidades

1. **2FA (Two-Factor Authentication)** - Admin e Teacher
2. **Chat em Tempo Real** - Professor ↔ Aluno
3. **Gamificação** - Badges, Rankings, Pontos
4. **Recomendações AI** - Cursos personalizados
5. **Webhooks de Pagamento** - Automação
6. **Relatórios Exportáveis** - CSV, PDF
7. **API Pública** - Integração com terceiros

---

**Desenvolvido com excelência pela VisionVII** — Transformando educação através da tecnologia.
