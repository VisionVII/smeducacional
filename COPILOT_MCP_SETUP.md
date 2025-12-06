# 🤖 Configuração do GitHub Copilot com MCP

## 📋 Visão Geral

Este documento descreve a configuração e integração do **GitHub Copilot** com **MCP (Model Context Protocol)** no VSCode para o projeto SM Educacional.

## 🔧 Pré-requisitos

### Extensões Necessárias

1. **GitHub Copilot** (`github.copilot`)
   - Extensão principal do GitHub Copilot
   - Fornece sugestões de código em tempo real

2. **GitHub Copilot Chat** (`github.copilot-chat`)
   - Interface de chat para interagir com o Copilot
   - Permite fazer perguntas e receber explicações

### Conta GitHub

- Conta GitHub com acesso ao GitHub Copilot
- Licença ativa do GitHub Copilot (Individual, Business ou Enterprise)

## 📦 Instalação

### 1. Instalar Extensões do VSCode

```bash
# Método 1: Via linha de comando
code --install-extension github.copilot
code --install-extension github.copilot-chat

# Método 2: Via VSCode
# 1. Abra o VSCode
# 2. Vá para Extensions (Ctrl+Shift+X)
# 3. Procure por "GitHub Copilot"
# 4. Instale ambas as extensões
```

### 2. Autenticar com GitHub

1. Após instalar as extensões, clique no ícone do Copilot na barra de status
2. Clique em "Sign in to GitHub"
3. Autorize o VSCode a acessar sua conta GitHub
4. Confirme no navegador

### 3. Abrir Workspace

```bash
# Opção 1: Via linha de comando
code smeducacional.code-workspace

# Opção 2: No VSCode
# File > Open Workspace from File > selecione smeducacional.code-workspace
```

## 🎯 Funcionalidades Configuradas

### 1. Copilot Inline Suggestions

- **Ativado para**: Todos os tipos de arquivo
- **Sugestões automáticas**: Habilitadas
- **Aceitar sugestão**: `Tab`
- **Próxima sugestão**: `Alt+]`
- **Sugestão anterior**: `Alt+[`

### 2. Copilot Chat

- **Locale**: Português Brasileiro (pt-BR)
- **Abrir chat**: `Ctrl+Shift+I` (Windows/Linux) ou `Cmd+Shift+I` (Mac)
- **Templates de projeto**: Habilitados
- **Contexto do workspace**: Automático

### 3. Contexto do Projeto

O Copilot tem acesso ao contexto do projeto através de:

- **copilot-instructions.md**: Instruções específicas do projeto
- **Estrutura de pastas**: Reconhecimento automático da arquitetura
- **Tecnologias detectadas**: Next.js, TypeScript, Prisma, React, etc.

## 📝 Instruções do Projeto

O arquivo `.github/copilot-instructions.md` contém:

- ✅ Stack tecnológica (Next.js 14+, TypeScript, Prisma, etc.)
- ✅ Padrões de código (TypeScript rigoroso, Clean Architecture)
- ✅ Estrutura de pastas
- ✅ Convenções de nomenclatura
- ✅ Validações e tratamento de erros

O Copilot usa essas instruções para gerar código consistente com o projeto.

## 🔍 Model Context Protocol (MCP)

### O que é MCP?

**Model Context Protocol (MCP)** é um protocolo que permite ao GitHub Copilot:

1. **Acessar contexto adicional** do projeto
2. **Entender a estrutura** da aplicação
3. **Seguir convenções** específicas do projeto
4. **Gerar código mais preciso** baseado no contexto

### Como o MCP Funciona Neste Projeto

1. **Detecção Automática**
   - O Copilot detecta automaticamente o tipo de projeto (Next.js)
   - Identifica as tecnologias usadas via `package.json`

2. **Leitura de Instruções**
   - Lê o arquivo `copilot-instructions.md`
   - Aplica as convenções definidas

3. **Contexto do Workspace**
   - Analisa a estrutura de pastas
   - Entende as relações entre arquivos
   - Reconhece padrões existentes

4. **Sugestões Contextualizadas**
   - Gera código seguindo os padrões do projeto
   - Usa as bibliotecas já instaladas
   - Mantém consistência com código existente

## 💡 Dicas de Uso

### 1. Usar Comentários Descritivos

```typescript
// Criar componente de dashboard do aluno com gráfico de progresso
// usando Recharts e Tailwind CSS
```

O Copilot gerará código baseado no contexto e instruções.

### 2. Usar Copilot Chat

```
// No chat:
"Como implementar autenticação com NextAuth neste projeto?"
"Criar um hook personalizado para buscar dados de cursos"
"Explicar este código"
```

### 3. Refatoração com Copilot

- Selecione código
- Clique com botão direito > "Copilot" > "Explain This"
- Ou peça para refatorar via chat

### 4. Geração de Testes

```typescript
// Gerar testes unitários para esta função usando Jest
```

### 5. Documentação Automática

```typescript
/**
 * // Pressione Enter e o Copilot gerará a documentação JSDoc
 */
```

## 🛠️ Troubleshooting

### Copilot não está funcionando

1. **Verificar autenticação**
   ```
   - Clique no ícone do Copilot na barra de status
   - Verifique se está conectado ao GitHub
   ```

2. **Verificar licença**
   - Acesse: https://github.com/settings/copilot
   - Confirme que a assinatura está ativa

3. **Recarregar VSCode**
   ```
   Ctrl+Shift+P > "Reload Window"
   ```

### Sugestões não aparecem

1. **Verificar se Copilot está habilitado**
   - Verifique o ícone na barra de status
   - Deve estar com checkmark verde

2. **Verificar tipo de arquivo**
   - Copilot funciona melhor com arquivos de código
   - Verifique se a linguagem está detectada corretamente

3. **Verificar settings**
   - `Ctrl+,` > procure "copilot"
   - Verifique se "Enable Auto Completions" está marcado

### Chat não funciona

1. **Atualizar extensão**
   ```
   Extensions > GitHub Copilot Chat > Update
   ```

2. **Verificar permissões**
   - Copilot Chat requer permissões adicionais
   - Reautentique se necessário

## 📊 Configurações Avançadas

### Personalizar Atalhos

1. `Ctrl+K Ctrl+S` para abrir atalhos
2. Procure por "copilot"
3. Configure seus atalhos preferidos

### Ajustar Comportamento

Edite `.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": false,
    "markdown": true
  },
  "github.copilot.editor.enableAutoCompletions": true
}
```

## 🔐 Segurança e Privacidade

### O que o Copilot vê?

- Código no arquivo atual
- Arquivos abertos no editor
- Conteúdo do `copilot-instructions.md`
- Estrutura básica do projeto

### O que NÃO é enviado?

- Arquivos em `.gitignore`
- Variáveis de ambiente (`.env`)
- Senhas ou secrets
- Dados sensíveis

### Boas Práticas

1. ✅ Nunca commitar secrets no código
2. ✅ Usar variáveis de ambiente
3. ✅ Revisar código gerado antes de usar
4. ✅ Testar código gerado adequadamente

## 📚 Recursos Adicionais

- [Documentação GitHub Copilot](https://docs.github.com/en/copilot)
- [VSCode Copilot Docs](https://code.visualstudio.com/docs/editor/artificial-intelligence)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub Copilot Prompts](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)

## 🎓 Exemplos de Uso no Projeto

### Criar Novo Componente

```typescript
// Criar componente Card de curso com imagem, título, descrição e botão
// usando shadcn/ui e Tailwind CSS
```

### Implementar API Route

```typescript
// Criar API route para buscar progresso do aluno
// usando Prisma e NextAuth para autenticação
```

### Adicionar Validação

```typescript
// Adicionar schema Zod para validação de formulário de cadastro
// campos: nome, email, senha
```

## ✅ Checklist de Verificação

- [ ] Extensões instaladas (github.copilot + github.copilot-chat)
- [ ] Autenticado com conta GitHub
- [ ] Licença do Copilot ativa
- [ ] Workspace aberto (smeducacional.code-workspace)
- [ ] Copilot habilitado (ícone verde na barra de status)
- [ ] Chat funcionando (Ctrl+Shift+I)
- [ ] Sugestões inline aparecendo
- [ ] copilot-instructions.md lido e entendido

## 🆘 Suporte

Se encontrar problemas:

1. Consulte a seção [Troubleshooting](#-troubleshooting)
2. Verifique [GitHub Copilot Status](https://www.githubstatus.com/)
3. Abra issue no repositório
4. Contate o suporte do GitHub

---

**Status**: ✅ Configurado e Pronto para Uso

**Última Atualização**: Dezembro 2024

**Mantido por**: VisionVII Team
