# 🚀 Guia Rápido: GitHub Copilot + MCP

## ⚡ Início Rápido

### 1️⃣ Instale as Extensões

```bash
code --install-extension github.copilot
code --install-extension github.copilot-chat
```

### 2️⃣ Abra o Workspace

```bash
code smeducacional.code-workspace
```

### 3️⃣ Autentique

- Clique no ícone do Copilot na barra de status (canto inferior direito)
- Clique em "Sign in to GitHub"
- Autorize no navegador

### 4️⃣ Verifique a Conexão

✅ **Copilot Funcionando**: Ícone verde com checkmark na barra de status
❌ **Problema**: Ícone vermelho ou com "X"

## 🎯 Atalhos Essenciais

| Ação | Windows/Linux | Mac |
|------|---------------|-----|
| **Aceitar sugestão** | `Tab` | `Tab` |
| **Próxima sugestão** | `Alt+]` | `Option+]` |
| **Sugestão anterior** | `Alt+[` | `Option+[` |
| **Abrir Chat** | `Ctrl+Shift+I` | `Cmd+Shift+I` |
| **Sugestões inline** | `Ctrl+Enter` | `Cmd+Enter` |

## 💬 Comandos do Chat

### Geral
- `/explain` - Explicar código selecionado
- `/fix` - Corrigir bugs no código
- `/tests` - Gerar testes
- `/doc` - Gerar documentação

### Específicos do Projeto
```
"Criar componente React com TypeScript usando shadcn/ui"
"Implementar API route com Prisma"
"Adicionar validação Zod para formulário"
"Refatorar este código seguindo Clean Architecture"
```

## 🎨 Exemplos de Uso

### 1. Criar Componente

```typescript
// Criar componente Button com variantes primary, secondary e ghost
// usando shadcn/ui, Tailwind CSS e TypeScript
```
*Pressione Enter e deixe o Copilot gerar*

### 2. Implementar Hook

```typescript
// Hook personalizado para buscar dados de cursos do aluno
// usar TanStack Query e Zustand para cache
```

### 3. API Route

```typescript
// API route POST para criar novo curso
// validar com Zod, usar Prisma, verificar autenticação
```

### 4. Validação

```typescript
// Schema Zod para validação de cadastro de usuário
// campos: nome (min 3), email (válido), senha (min 8)
```

## 🔍 Verificar Contexto MCP

O Copilot tem contexto de:

✅ **copilot-instructions.md**: Padrões e convenções do projeto
✅ **package.json**: Tecnologias e dependências
✅ **Estrutura de pastas**: Arquitetura da aplicação
✅ **Código existente**: Padrões de código usados

## ⚙️ Configurações Importantes

### Habilitar/Desabilitar

```json
// .vscode/settings.json
{
  "github.copilot.enable": {
    "*": true,           // Todos os arquivos
    "markdown": true,    // Arquivos MD
    "plaintext": false   // Texto plano
  }
}
```

### Localização

```json
{
  "github.copilot.chat.localeOverride": "pt-BR"
}
```

## 🐛 Problemas Comuns

### Copilot não sugere

1. Verifique se está habilitado (ícone verde)
2. Recarregue a janela: `Ctrl+Shift+P` > "Reload Window"
3. Verifique sua licença: https://github.com/settings/copilot

### Sugestões ruins

1. Escreva comentários mais descritivos
2. Adicione mais contexto no código
3. Use o Chat para instruções específicas

### Chat não abre

1. Atualize a extensão
2. Reautentique com GitHub
3. Reinicie o VSCode

## 📊 Produtividade

### Boas Práticas

✅ **Escreva comentários claros** antes de deixar o Copilot sugerir
✅ **Revise o código gerado** antes de aceitar
✅ **Use o Chat** para tarefas complexas
✅ **Aproveite o contexto** do projeto (copilot-instructions.md)
✅ **Teste o código** gerado adequadamente

❌ **Não confie cegamente** nas sugestões
❌ **Não commite** código sem revisar
❌ **Não ignore** warnings do linter

## 🔐 Segurança

### O que é Seguro

✅ Código público
✅ Lógica de negócio geral
✅ Componentes UI
✅ Tipos e interfaces

### ⚠️ Cuidado com

❌ Senhas e secrets
❌ Chaves de API
❌ Tokens de autenticação
❌ Dados sensíveis

**Sempre use variáveis de ambiente (.env)**

## 📱 Dica de Workflow

### Fluxo Ideal

1. **Escreva comentário** descrevendo o que precisa
2. **Deixe Copilot sugerir** (aguarde 1-2s)
3. **Revise a sugestão**
4. **Aceite ou modifique** conforme necessário
5. **Teste o código**
6. **Use Chat** se precisar de ajustes

### Exemplo Completo

```typescript
// 1. Escreva o comentário
// Criar função para calcular progresso do aluno em um curso
// retornar porcentagem baseada em aulas completadas

// 2. Copilot sugere (pressione Tab para aceitar)
export function calculateProgress(completedLessons: number, totalLessons: number): number {
  if (totalLessons === 0) return 0;
  return Math.round((completedLessons / totalLessons) * 100);
}

// 3. Se quiser melhorar, use o Chat:
// "Adicionar validações e tratamento de erros a esta função"
```

## 📚 Recursos

- 📖 [Documentação Completa](./COPILOT_MCP_SETUP.md)
- 🎓 [Instruções do Projeto](./.github/copilot-instructions.md)
- 🔗 [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- 💡 [Dicas de Prompts](https://github.blog/2023-06-20-how-to-write-better-prompts-for-github-copilot/)

## ✅ Checklist Diário

Antes de começar a programar:

- [ ] VSCode aberto com workspace (smeducacional.code-workspace)
- [ ] Copilot habilitado (ícone verde)
- [ ] Chat funcionando (teste com Ctrl+Shift+I)
- [ ] Copilot-instructions.md revisado
- [ ] `.env` configurado corretamente

---

**Dúvidas?** Consulte [COPILOT_MCP_SETUP.md](./COPILOT_MCP_SETUP.md) para documentação detalhada.

**Status**: ✅ Pronto para uso
