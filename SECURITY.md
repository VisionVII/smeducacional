# Política de Segurança

## Versões Suportadas

Use esta seção para informar aos usuários sobre quais versões do SM Educacional estão atualmente sendo suportadas com atualizações de segurança.

| Versão | Suportada          |
| ------ | ------------------ |
| 1.0.x  | :white_check_mark: |
| < 1.0  | :x:                |

## Reportando uma Vulnerabilidade

A segurança do SM Educacional é levada a sério. Se você descobrir uma vulnerabilidade de segurança, agradecemos seus esforços para divulgá-la de forma responsável.

### Como Reportar

**Por favor, NÃO reporte vulnerabilidades de segurança através de issues públicas do GitHub.**

Em vez disso, envie um email para: **visionvii.tech@gmail.com**

Você deve receber uma resposta dentro de **48 horas úteis**. Se por algum motivo você não receber, por favor, acompanhe via email para garantir que recebemos sua mensagem original.

### Informações a Incluir

Para nos ajudar a entender melhor a natureza e o escopo do possível problema, por favor inclua o máximo de informações possível:

- **Tipo de vulnerabilidade** (ex: SQL injection, XSS, CSRF, etc.)
- **Localização do código-fonte afetado** (tag/branch/commit ou URL direto)
- **Configurações especiais necessárias** para reproduzir o problema
- **Passos detalhados para reproduzir** a vulnerabilidade
- **Prova de conceito ou código de exploit** (se possível)
- **Impacto potencial** da vulnerabilidade
- **Possíveis mitigações** que você identificou

Estas informações nos ajudarão a avaliar e responder ao seu relatório mais rapidamente.

## Política de Divulgação

### Nosso Compromisso

- Confirmaremos o recebimento do seu relatório de vulnerabilidade dentro de **48 horas**
- Forneceremos uma avaliação inicial da vulnerabilidade dentro de **7 dias**
- Manteremos você informado sobre o progresso da correção
- Creditaremos você pela descoberta (se desejar) quando a vulnerabilidade for divulgada publicamente

### Cronograma de Correção

- **Vulnerabilidades Críticas:** Correção em até 7 dias
- **Vulnerabilidades Altas:** Correção em até 30 dias
- **Vulnerabilidades Médias:** Correção em até 60 dias
- **Vulnerabilidades Baixas:** Correção em até 90 dias

### Divulgação Pública

Solicitamos que você:

- Nos dê tempo razoável para investigar e corrigir a vulnerabilidade antes de divulgá-la publicamente
- Não explore a vulnerabilidade além do necessário para demonstrá-la
- Não acesse, modifique ou exclua dados de outros usuários
- Não execute ataques de negação de serviço

Após a correção ser implementada e testada, coordenaremos com você o momento apropriado para divulgação pública.

## Recompensas

Atualmente, não oferecemos um programa de bug bounty monetário. No entanto, reconhecemos e agradecemos publicamente os pesquisadores de segurança que nos ajudam a manter o SM Educacional seguro.

Pesquisadores que reportarem vulnerabilidades válidas receberão:

- Reconhecimento público em nosso arquivo SECURITY.md (se desejado)
- Menção em nossas notas de versão
- Nossa gratidão sincera

## Escopo

### No Escopo

As seguintes áreas estão no escopo para relatórios de vulnerabilidade:

- Aplicação web principal (SM Educacional)
- APIs e endpoints
- Processos de autenticação e autorização
- Manipulação de dados sensíveis (dados de alunos, professores, notas)
- Dependências de terceiros com vulnerabilidades conhecidas
- Sistema de recuperação de senha
- Integração com serviços de email (Resend)

### Fora do Escopo

As seguintes áreas estão fora do escopo:

- Ataques de engenharia social
- Negação de serviço (DoS/DDoS)
- Vulnerabilidades em sistemas de terceiros fora do nosso controle
- Problemas que requerem acesso físico ao dispositivo do usuário
- Vulnerabilidades em versões não suportadas
- Problemas de UX/UI que não representam risco de segurança

## Boas Práticas de Segurança

### Para Usuários

- Mantenha suas credenciais seguras e não as compartilhe
- Use senhas fortes e únicas
- Habilite autenticação de dois fatores quando disponível
- Mantenha seu navegador atualizado
- Reporte comportamentos suspeitos imediatamente
- Não compartilhe links de recuperação de senha

### Para Desenvolvedores

- Revise o código antes de fazer merge
- Use ferramentas de análise de segurança estática
- Mantenha dependências atualizadas (use Dependabot)
- Siga princípios de segurança por design
- Implemente testes de segurança automatizados
- Nunca commite secrets ou credenciais
- Use variáveis de ambiente para configurações sensíveis

## Histórico de Vulnerabilidades

Mantemos um registro de vulnerabilidades corrigidas para transparência:

### 2025

- **30/11/2025:** Auditoria inicial de segurança realizada
  - Dependabot Alerts habilitado
  - Dependabot Security Updates habilitado
  - 2FA configurado na conta GitHub
  - Política de segurança estabelecida

## Contato

Para questões gerais de segurança (não vulnerabilidades específicas):

- **Email:** visionvii.tech@gmail.com
- **GitHub:** [@VisionVII](https://github.com/VisionVII)
- **Repositório:** [VisionVII/smeducacional](https://github.com/VisionVII/smeducacional)

## Agradecimentos

Agradecemos aos seguintes pesquisadores de segurança por nos ajudarem a manter o SM Educacional seguro:

- *Nenhum contribuidor ainda*

---

**Última Atualização:** 30 de novembro de 2025  
**Versão da Política:** 1.0  
**Projeto:** SM Educacional - Sistema de Gestão Escolar  
**Organização:** VisionVII
