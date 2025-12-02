# Screenshots do Sistema SM Educacional

## Instruções para Captura de Screenshots

Para gerar os screenshots, siga os passos:

1. Certifique-se que o servidor está rodando: `npm run dev`
2. Faça login com as credenciais do seed:
   - **Admin**: admin@smeducacional.com / admin123
   - **Professor**: professor@smeducacional.com / teacher123
   - **Aluno**: aluno@smeducacional.com / student123
3. Use uma ferramenta de captura de tela ou extensão do navegador
4. Capture em resolução 1920x1080 para melhor qualidade
5. Salve na pasta `screenshots/` com o nome correspondente

---

## 📋 Páginas Públicas

### 1. Página Inicial (`/`)
**Arquivo**: `01-home.png`
**Descrição**: Landing page principal do sistema com apresentação da plataforma
**Objetivo**: Apresentar a plataforma, destacar cursos e incentivar cadastro
**Elementos**:
- Hero section com CTA
- Cursos em destaque
- Categorias disponíveis
- Estatísticas da plataforma
- Depoimentos (se houver)

### 2. Catálogo de Cursos (`/courses`)
**Arquivo**: `02-courses-catalog.png`
**Descrição**: Listagem de todos os cursos disponíveis na plataforma
**Objetivo**: Permitir navegação e busca de cursos por categoria/filtros
**Elementos**:
- Grid de cards de cursos
- Filtros por categoria
- Informações: título, instrutor, duração, nível, preço
- Botão de matrícula/visualização

### 3. Sobre (`/about`)
**Arquivo**: `03-about.png`
**Descrição**: Página institucional com missão, visão e valores
**Objetivo**: Apresentar a empresa e gerar confiança
**Elementos**:
- Hero com título
- Missão e Visão
- Estatísticas (alunos, cursos, certificados)
- Valores da empresa
- CTA para cadastro

### 4. FAQ (`/faq`)
**Arquivo**: `04-faq.png`
**Descrição**: Perguntas frequentes em formato accordion
**Objetivo**: Responder dúvidas comuns e reduzir suporte
**Elementos**:
- Lista de perguntas categorizadas
- Respostas em accordion
- Busca de perguntas (se implementado)

### 5. Contato (`/contact`)
**Arquivo**: `05-contact.png`
**Descrição**: Formulário de contato e informações da empresa
**Objetivo**: Facilitar comunicação entre usuários e empresa
**Elementos**:
- Formulário de contato
- Email, telefone, endereço
- Mapa (se implementado)

### 6. Termos de Uso (`/terms`)
**Arquivo**: `06-terms.png`
**Descrição**: Termos e condições de uso da plataforma
**Objetivo**: Documentar regras e responsabilidades legais
**Elementos**:
- Texto legal formatado
- Seções organizadas
- Data de atualização

### 7. Política de Privacidade (`/privacy`)
**Arquivo**: `07-privacy.png`
**Descrição**: Política de privacidade e tratamento de dados (LGPD)
**Objetivo**: Transparência sobre coleta e uso de dados
**Elementos**:
- Informações sobre coleta de dados
- Direitos do usuário
- Conformidade com LGPD
- Contato do DPO

### 8. Login (`/login`)
**Arquivo**: `08-login.png`
**Descrição**: Tela de autenticação do sistema
**Objetivo**: Permitir acesso seguro à plataforma
**Elementos**:
- Formulário de email/senha
- Link para recuperação de senha
- Link para cadastro
- Validações de formulário

### 9. Cadastro (`/register`)
**Arquivo**: `09-register.png`
**Descrição**: Formulário de criação de conta
**Objetivo**: Permitir novos usuários se registrarem
**Elementos**:
- Campos: nome, email, senha, confirmação
- Seleção de tipo de conta (se aplicável)
- Termos e condições
- Validações

### 10. Recuperar Senha (`/forgot-password`)
**Arquivo**: `10-forgot-password.png`
**Descrição**: Solicitação de código para redefinir senha
**Objetivo**: Permitir recuperação de conta
**Elementos**:
- Campo de email
- Envio de código por email
- Verificação de código
- Redefinição de senha

---

## 👨‍🎓 Área do Aluno

### 11. Dashboard do Aluno (`/student/dashboard`)
**Arquivo**: `11-student-dashboard.png`
**Descrição**: Visão geral do progresso e atividades do aluno
**Objetivo**: Centralizar informações importantes do aluno
**Elementos**:
- Estatísticas: cursos matriculados, progresso, certificados
- Cursos em andamento
- Atividades pendentes
- Notificações recentes

### 12. Meus Cursos (`/student/courses`)
**Arquivo**: `12-student-courses.png`
**Descrição**: Lista de cursos em que o aluno está matriculado
**Objetivo**: Acesso rápido aos cursos e acompanhamento de progresso
**Elementos**:
- Cards de cursos matriculados
- Barra de progresso
- Último acesso
- Botão "Continuar assistindo"

### 13. Visualizar Curso (`/student/courses/[id]`)
**Arquivo**: `13-student-course-view.png`
**Descrição**: Player de vídeo e conteúdo da aula
**Objetivo**: Assistir aulas e acessar materiais
**Elementos**:
- Player de vídeo
- Sidebar com módulos e aulas
- Descrição da aula
- Materiais para download
- Marcação de conclusão

### 14. Atividades (`/student/activities`)
**Arquivo**: `14-student-activities.png`
**Descrição**: Lista de atividades, provas e trabalhos
**Objetivo**: Visualizar e submeter atividades
**Elementos**:
- Lista de atividades pendentes
- Status: pendente, em andamento, concluída
- Data de entrega
- Notas recebidas

### 15. Certificados (`/student/certificates`)
**Arquivo**: `15-student-certificates.png`
**Descrição**: Certificados obtidos pelo aluno
**Objetivo**: Visualizar e baixar certificados
**Elementos**:
- Cards de certificados
- Data de emissão
- Curso relacionado
- Botão de download/visualização

### 16. Mensagens (`/student/messages`)
**Arquivo**: `16-student-messages.png`
**Descrição**: Sistema de mensagens com professores
**Objetivo**: Comunicação direta com instrutores
**Elementos**:
- Lista de conversas
- Área de mensagens
- Envio de novas mensagens

### 17. Notificações (`/student/notifications`)
**Arquivo**: `17-student-notifications.png`
**Descrição**: Central de notificações do sistema
**Objetivo**: Manter aluno informado sobre atualizações
**Elementos**:
- Lista de notificações
- Indicador de lidas/não lidas
- Tipos: novas aulas, atividades, mensagens, avisos

### 18. Perfil do Aluno (`/student/profile`)
**Arquivo**: `18-student-profile.png`
**Descrição**: Dados pessoais e configurações da conta
**Objetivo**: Gerenciar informações pessoais
**Elementos**:
- Foto de perfil
- Dados: nome, email, telefone, bio
- Alteração de senha
- Preferências de notificação

---

## 👨‍🏫 Área do Professor

### 19. Dashboard do Professor (`/teacher/dashboard`)
**Arquivo**: `19-teacher-dashboard.png`
**Descrição**: Visão geral das atividades de ensino
**Objetivo**: Acompanhar métricas e atividades dos cursos
**Elementos**:
- Total de cursos criados
- Total de alunos
- Atividades pendentes de correção
- Mensagens não lidas

### 20. Meus Cursos (Professor) (`/teacher/courses`)
**Arquivo**: `20-teacher-courses.png`
**Descrição**: Lista de cursos criados pelo professor
**Objetivo**: Gerenciar cursos existentes
**Elementos**:
- Cards dos cursos
- Status: publicado/rascunho
- Número de alunos matriculados
- Botões: editar, gerenciar conteúdo, visualizar alunos

### 21. Criar Novo Curso (`/teacher/courses/new`)
**Arquivo**: `21-teacher-new-course.png`
**Descrição**: Formulário de criação de curso
**Objetivo**: Criar novos cursos na plataforma
**Elementos**:
- Informações básicas: título, descrição, categoria
- Upload de thumbnail
- Configurações: nível, duração, preço
- Requisitos e objetivos de aprendizagem

### 22. Editar Curso (`/teacher/courses/[id]/edit`)
**Arquivo**: `22-teacher-edit-course.png`
**Descrição**: Edição de informações do curso
**Objetivo**: Atualizar dados do curso
**Elementos**:
- Mesmos campos da criação
- Histórico de alterações (se houver)
- Botão de publicar/despublicar

### 23. Gerenciar Conteúdo (`/teacher/courses/[id]/content`)
**Arquivo**: `23-teacher-course-content.png`
**Descrição**: Estrutura de módulos e aulas do curso
**Objetivo**: Organizar e adicionar conteúdo
**Elementos**:
- Lista de módulos
- Aulas por módulo
- Botões: adicionar módulo, adicionar aula
- Upload de vídeos
- Reordenação drag-and-drop

### 24. Alunos do Curso (`/teacher/courses/[id]/students`)
**Arquivo**: `24-teacher-students.png`
**Descrição**: Lista de alunos matriculados no curso
**Objetivo**: Acompanhar progresso dos alunos
**Elementos**:
- Lista de alunos
- Progresso individual
- Última atividade
- Opção de enviar mensagem

### 25. Mensagens (Professor) (`/teacher/messages`)
**Arquivo**: `25-teacher-messages.png`
**Descrição**: Sistema de mensagens com alunos
**Objetivo**: Comunicação com alunos
**Elementos**:
- Lista de conversas
- Filtro por curso
- Área de mensagens

### 26. Perfil do Professor (`/teacher/profile`)
**Arquivo**: `26-teacher-profile.png`
**Descrição**: Perfil público e configurações
**Objetivo**: Gerenciar informações e bio profissional
**Elementos**:
- Foto e bio profissional
- Redes sociais
- Áreas de expertise
- Configurações de conta

---

## 👨‍💼 Área do Administrador

### 27. Dashboard Admin (`/admin/dashboard`)
**Arquivo**: `27-admin-dashboard.png`
**Descrição**: Painel administrativo com métricas gerais
**Objetivo**: Visão geral do sistema
**Elementos**:
- Total de usuários (alunos, professores)
- Total de cursos
- Matrículas recentes
- Receita (se aplicável)
- Gráficos e estatísticas

### 28. Gestão de Usuários (`/admin/users`)
**Arquivo**: `28-admin-users.png`
**Descrição**: CRUD de usuários do sistema
**Objetivo**: Gerenciar contas de usuários
**Elementos**:
- Tabela de usuários
- Filtros por role
- Busca por nome/email
- Ações: editar, excluir, ativar/desativar

### 29. Gestão de Cursos (`/admin/courses`)
**Arquivo**: `29-admin-courses.png`
**Descrição**: Listagem e gestão de todos os cursos
**Objetivo**: Moderar e gerenciar cursos da plataforma
**Elementos**:
- Lista de cursos
- Status de publicação
- Instrutor responsável
- Ações: editar, excluir, publicar/despublicar

### 30. Gestão de Categorias (`/admin/categories`)
**Arquivo**: `30-admin-categories.png`
**Descrição**: CRUD de categorias de cursos
**Objetivo**: Organizar taxonomia dos cursos
**Elementos**:
- Lista de categorias
- Número de cursos por categoria
- Ações: criar, editar, excluir

---

## 📊 Resumo das Capturas

**Total**: 30 screenshots
- **Públicas**: 10 páginas
- **Aluno**: 8 páginas
- **Professor**: 8 páginas
- **Admin**: 4 páginas

## 🎨 Padrões Visuais a Observar

✅ Todas as páginas devem ter:
- Navbar no topo (pública ou autenticada)
- Footer no rodapé
- Breadcrumbs (páginas autenticadas)
- Tema claro/escuro funcional
- Design responsivo
- Componentes consistentes (botões, cards, inputs)

## 🔧 Como Usar Este Documento

1. Use como checklist para captura de screenshots
2. Inclua as descrições ao apresentar para o cliente
3. Organize os arquivos seguindo a numeração
4. Mantenha atualizado conforme novas funcionalidades

---

**Data de criação**: 2 de dezembro de 2025  
**Projeto**: SM Educacional  
**Versão**: 1.0
