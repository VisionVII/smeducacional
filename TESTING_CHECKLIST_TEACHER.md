# 🧪 CHECKLIST DE TESTES - Áreas do Professor

**Data:** 6 de dezembro de 2025  
**Responsável:** QA / Testes Locais  
**Status:** Pronto para Teste

---

## ✅ TESTE DE FUNCIONALIDADES - DASHBOARD

### Visual & Layout
- [ ] Hero section aparece com avatar, nome, título
- [ ] 4 KPIs aparecem lado a lado
- [ ] Cards de ações pendentes mostram alertas corretos
- [ ] Widgets direita (Perfil, Reputação, Engajamento) aparecem
- [ ] Footer com 4 insights aparece
- [ ] Layout responsivo em mobile (testar em 375px)
- [ ] Layout responsivo em tablet (testar em 768px)
- [ ] Layout responsivo em desktop (testar em 1920px)

### Dados
- [ ] Número de cursos está correto (soma de todos os cursos)
- [ ] Número de alunos está correto (soma de enrollments)
- [ ] Número de módulos está correto
- [ ] Número de aulas está correto (soma de lessons)
- [ ] Status de publicação correto (Publicado/Rascunho)
- [ ] Barra de progresso do perfil reflete campos completos

### Interatividade
- [ ] Botão "Novo Curso" leva para /teacher/courses/new
- [ ] Botão "Editar Perfil" leva para /teacher/profile
- [ ] Botão "Ver Mensagens" leva para /teacher/messages
- [ ] Links em widgets funcionam corretamente
- [ ] Hover effects aparecem em cards

### Performance
- [ ] Dashboard carrega em menos de 2 segundos
- [ ] Sem erros no console
- [ ] TypeScript sem warnings

---

## ✅ TESTE DE FUNCIONALIDADES - PROFILE

### Navegação de Tabs
- [ ] 7 tabs aparecem: Pessoais, Formação, Atuação, Engajamento, Avaliações, Financeiro, Segurança
- [ ] Clique em tab muda o conteúdo
- [ ] Indicador visual mostra tab ativa (border-bottom)
- [ ] Ícones aparecem em cada tab
- [ ] Tabs roláveis em mobile

### TAB: Pessoais
- [ ] Campo Nome pré-preenchido com nome do usuário
- [ ] Campo Email pré-preenchido com email
- [ ] Campos vazios: Telefone, CPF, Endereço, Bio
- [ ] Botão "Salvar Alterações" funciona
- [ ] Toast de sucesso aparece ao salvar
- [ ] Dados persistem ao recarregar página

### TAB: Formação
- [ ] Qualificação inicial aparece (Pedagogia, Universidade Federal, 2015)
- [ ] Botão "X" remove qualificação
- [ ] Campos para adicionar nova qualificação aparecem
- [ ] Validação: não permite salvar sem Grau e Instituição
- [ ] Qualificação adicionada aparece na lista

### TAB: Atuação
- [ ] 4 campos aparecem: Disciplinas, Níveis, Experiência, Modalidade
- [ ] Botão "Salvar Atuação" presente
- [ ] Campos aceitam texto

### TAB: Engajamento
- [ ] 4 métricas aparecem em grid
- [ ] Valores mostram "-" ou "0" (placeholders)

### TAB: Avaliações
- [ ] Ícone de star aparece
- [ ] Mensagem "Ainda sem avaliações" aparece

### TAB: Financeiro
- [ ] 4 campos aparecem: Banco, Agência, Conta (password), Tipo
- [ ] Botão "Salvar Dados Bancários" presente

### TAB: Segurança
- [ ] 3 campos de senha aparecem: Atual, Nova, Confirmar
- [ ] Botão "Alterar Senha" funciona
- [ ] Validação: senhas devem coincidir
- [ ] Validação: não permite senha vazia
- [ ] Card de 2FA aparece
- [ ] Card de Histórico de Acessos aparece

### Hero Section
- [ ] Avatar aparece (se houver foto)
- [ ] Botão upload foto funciona
- [ ] Nome completo aparece
- [ ] Título "Professor | Educador Digital" aparece
- [ ] Status badge "Ativo" aparece
- [ ] Badge com "75% Completo" aparece
- [ ] Email aparece
- [ ] Data de membro formatada corretamente

---

## ✅ TESTE DE FUNCIONALIDADES - MENSAGENS

### Layout
- [ ] 2 colunas aparecem (lista | chat)
- [ ] Em mobile, muda para layout stacked
- [ ] Busca funciona (filtra por nome)

### Lista de Conversas
- [ ] Conversas aparecem (ou empty state)
- [ ] Avatar com iniciais do nome aparece
- [ ] Nome do participante aparece
- [ ] Rol/tipo aparece em badge
- [ ] Última mensagem aparece (com line-clamp)
- [ ] Timestamp da última mensagem aparece
- [ ] Badge vermelha com contagem de não-lidos (se houver)

### Área de Chat
- [ ] Quando nenhuma conversa selecionada, mostra "Selecione uma conversa"
- [ ] Ao clicar conversa, carrega mensagens
- [ ] Mensagens antigas aparecem no topo
- [ ] Mensagens recentes aparecem no final
- [ ] Mensagens próprias aparecem à direita (azul)
- [ ] Mensagens outras aparecem à esquerda (cinza)
- [ ] Timestamps aparecem em cada mensagem

### Enviar Mensagem
- [ ] Campo input funciona
- [ ] Botão Send aparece
- [ ] Ao clicar, mensagem é enviada
- [ ] Enter key também envia (se não com Shift)
- [ ] Campo limpa após envio

---

## ✅ TESTE DE FUNCIONALIDADES - CURSOS

### Layout
- [ ] Header com título, descrição, botão "Novo Curso"
- [ ] 4 stats cards: Total, Publicados, Rascunhos, Alunos
- [ ] Stats cards têm cores/ícones diferentes
- [ ] Listagem de cursos aparece em grid

### Cards de Curso
- [ ] Thumbnail aparece (ou ícone placeholder)
- [ ] Título do curso aparece
- [ ] Status badge aparece (Publicado/Rascunho)
- [ ] Descrição aparece (com line-clamp-2)
- [ ] Ícones com stats: módulos, aulas, alunos, nível
- [ ] 3 botões aparecem: Visualizar, Editar, Conteúdo

### Ações
- [ ] Botão "Visualizar" abre em nova aba
- [ ] Botão "Editar" leva para /teacher/courses/[id]/edit
- [ ] Botão "Conteúdo" leva para /teacher/courses/[id]/content
- [ ] Botão "Novo Curso" leva para /teacher/courses/new

### Empty State
- [ ] Se nenhum curso, mostra ícone + mensagem + CTA
- [ ] CTA leva para criar novo curso

---

## ✅ TESTE DE FUNCIONALIDADES - EDITAR CURSO

### Carregamento
- [ ] Página carrega com dados do curso
- [ ] Campos pré-preenchidos com valores do curso
- [ ] Categorias carregadas no select

### Formulário
- [ ] Campo título editável
- [ ] Campo slug editável
- [ ] Campo descrição (textarea) editável
- [ ] Upload de thumbnail funciona
- [ ] Campo duração aceitável (números)
- [ ] Select nível funciona
- [ ] Campo preço editável
- [ ] Toggle "Pago" funciona
- [ ] Toggle "Publicado" funciona
- [ ] Select categoria funciona
- [ ] Campos requirements/whatYouLearn funcionam

### Salvamento
- [ ] Botão "Salvar" funciona
- [ ] Validação de campos obrigatórios
- [ ] Toast de sucesso aparece
- [ ] Redireciona para /teacher/courses após sucesso

### Exclusão
- [ ] Botão "Deletar" aparece
- [ ] Confirmação modal aparece
- [ ] Se confirmar, curso é deletado
- [ ] Redireciona para /teacher/courses

---

## ✅ TESTE DE FUNCIONALIDADES - CONTEÚDO

### Interface
- [ ] Back button funciona
- [ ] Título do curso aparece
- [ ] Tree view de módulos/aulas aparece

### Módulos
- [ ] Lista de módulos aparece
- [ ] Cada módulo tem ordem, título, descrição
- [ ] Botão expandir/colapsar funciona
- [ ] Botão adicionar módulo funciona

### Lições
- [ ] Lições aparecem dentro do módulo expandido
- [ ] Cada lição tem ordem, título, duração
- [ ] Botão adicionar lição funciona
- [ ] Upload de vídeo funciona

### Drag & Drop (se implementado)
- [ ] Reordenação de módulos funciona
- [ ] Reordenação de lições funciona
- [ ] Ordem persiste ao salvar

---

## ✅ TESTE DE FUNCIONALIDADES - ALUNOS

### Layout
- [ ] Título do curso aparece
- [ ] Back button funciona
- [ ] Tabela de alunos aparece (ou empty state)

### Tabela
- [ ] Colunas: Nome, Email, Progresso, Aulas Completadas, Última Atividade
- [ ] Dados corretos para cada aluno
- [ ] Avatar/iniciais aparecem
- [ ] Progresso em % aparece

### Filtros (se implementado)
- [ ] Busca por nome funciona
- [ ] Filter por status funciona
- [ ] Resultados atualizam

### Ações
- [ ] Botão "Ver Perfil" funciona (se implementado)
- [ ] Botão "Remover" funciona (se implementado)
- [ ] Confirmação aparece antes de deletar

---

## ⚠️ TESTES DE EDGE CASES

### Dados Vazios
- [ ] Dashboard com 0 cursos
- [ ] Profile sem nenhuma qualificação adicionada
- [ ] Curso com 0 módulos
- [ ] Curso com 0 alunos

### Validação
- [ ] Nome vazio não salva
- [ ] Email inválido não salva (se validação)
- [ ] Senhas diferentes mostram erro
- [ ] Campos obrigatórios validam

### Performance
- [ ] Dashboard carrega rápido (< 2s)
- [ ] Profile carrega rápido
- [ ] Troca de tabs é fluida
- [ ] Sem lag na digitação

### Segurança
- [ ] Usuário não pode editar cursos de outro professor
- [ ] Usuário não pode deletar cursos
- [ ] Senhas não aparecem em plain text
- [ ] Dados sensíveis (CPF, conta) protegidos

---

## 🔍 TESTES DE INTEGRAÇÃO

### API Calls
- [ ] Dashboard fetch de cursos funciona
- [ ] Profile update envia dados corretos
- [ ] Mensagens carregam via API
- [ ] Upload de arquivo funciona

### Estado Compartilhado
- [ ] Session mantém autenticação
- [ ] Dados do usuário carregam corretamente
- [ ] Avatar atualiza em tempo real

### Navegação
- [ ] Links internos funcionam
- [ ] Back button funciona
- [ ] Redirecionar após ações funciona

---

## 🎯 BUGS CONHECIDOS (Verificar)

- [ ] Nenhum erro de TypeScript
- [ ] Nenhum erro no console
- [ ] Nenhum warning de React
- [ ] Nenhum console.error

---

## ✅ CHECKLIST FINAL

- [ ] Todas as funcionalidades testadas
- [ ] Sem bugs críticos encontrados
- [ ] Performance aceitável
- [ ] Responsividade OK
- [ ] Pronto para screenshots
- [ ] Pronto para produção

---

## 📝 NOTAS DE TESTE

**Ambiente de Teste:**
- URL: http://localhost:3000
- Browser: Chrome (Latest)
- Mobile: iPhone 12 / Samsung S21
- Tablet: iPad Air

**Credenciais:**
- Admin: admin@smeducacional.com / admin123
- Professor: professor@smeducacional.com / teacher123
- Aluno: aluno@smeducacional.com / student123

**Data de Teste:** ___________  
**Testador:** ___________  
**Status:** Passou ✅ / Falhou ❌

---

> Imprima este checklist e marque conforme testa cada funcionalidade!
