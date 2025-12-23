## ✅ CHECKLIST DE EXECUÇÃO: Upload de Imagens

### 📋 Fase 1: Setup Supabase (5-10 minutos)

- [ ] **1.1** Abrir https://console.supabase.io
- [ ] **1.2** Selecionar seu projeto
- [ ] **1.3** Ir em **Storage** → **Buckets**
- [ ] **1.4** Clique em **New bucket**
- [ ] **1.5** Preencher:
  - [ ] Nome: `public-pages`
  - [ ] Deixar como **Public** ✅
- [ ] **1.6** Clicar em **Create**
- [ ] **1.7** Bucket `public-pages` agora aparece na lista

### 📋 Fase 2: Configurar Políticas RLS (5-10 minutos)

**No dashboard Supabase:**

- [ ] **2.1** Selecionar bucket `public-pages`
- [ ] **2.2** Ir em **Policies**

**Adicionar 4 Políticas (copiar e colar SQL Editor):**

- [ ] **2.3** Copiar conteúdo de `setup-public-pages-bucket.sql`
- [ ] **2.4** Abrir **SQL Editor** (em Supabase)
- [ ] **2.5** Colar script SQL
- [ ] **2.6** Clique em **Run**
- [ ] **2.7** Confirmar que 4 policies foram criadas

**Alternativa (Manual):**

- [ ] **2.8** Policy 1: SELECT (leitura pública)
- [ ] **2.9** Policy 2: INSERT (upload autenticado)
- [ ] **2.10** Policy 3: UPDATE (atualização autenticada)
- [ ] **2.11** Policy 4: DELETE (deleção autenticada)

### 📋 Fase 3: Verificar Instalação (2-5 minutos)

- [ ] **3.1** Dev server está rodando: `npm run dev`
- [ ] **3.2** Acessar http://localhost:3000/admin/public-pages
- [ ] **3.3** Estar logado como ADMIN
- [ ] **3.4** Página carrega sem erros

### 📋 Fase 4: Testar Upload (5 minutos)

#### Teste 1: Criar Página

- [ ] **4.1** Clicar em **Nova Página**
- [ ] **4.2** Preencher:
  - [ ] Slug: `teste`
  - [ ] Título: `Página de Teste`
  - [ ] Descrição: (opcional)
- [ ] **4.3** Campos preenchidos aparecem no formulário

#### Teste 2: Upload de Banner

- [ ] **4.4** Ir para seção **Mídia**
- [ ] **4.5** Clique em **Banner (Imagem de Destaque)**
- [ ] **4.6** Selecionar imagem do computador (JPG ou PNG)
  - [ ] Tamanho: máx 10MB
  - [ ] Tipo: imagem válida
- [ ] **4.7** Aguardar upload completar
- [ ] **4.8** Ver spinner desaparecer
- [ ] **4.9** Ver preview da imagem na tela
- [ ] **4.10** Botão X aparece para remover

#### Teste 3: Upload de Ícone

- [ ] **4.11** Repetir Teste 2 para **Ícone (Logo/Ícone da Página)**
- [ ] **4.12** Tamanho: máx 5MB

#### Teste 4: Salvar Página

- [ ] **4.13** Verificar que:
  - [ ] Slug está preenchido ✓
  - [ ] Título está preenchido ✓
  - [ ] Botão **Salvar** está ativado (não cinzento)
- [ ] **4.14** Clique em **Salvar**
- [ ] **4.15** Aguardar mensagem de sucesso
- [ ] **4.16** Toast verde aparece: "Página criada com sucesso"

#### Teste 5: Verificar no Banco

- [ ] **4.17** Página aparece na lista (esquerda)
- [ ] **4.18** Clique na página criada
- [ ] **4.19** Formulário preenche com os dados
- [ ] **4.20** Imagens aparecem nos previews

#### Teste 6: Visualizar no Preview

- [ ] **4.21** Iframe à direita mostra preview da página
- [ ] **4.22** Imagens aparecem no preview
- [ ] **4.23** Clique em **Abrir em nova aba**
- [ ] **4.24** Nova aba abre com página `/teste`
- [ ] **4.25** Imagens visíveis na página pública

### 📋 Fase 5: Testar Edição (3 minutos)

- [ ] **5.1** Clique em página existente
- [ ] **5.2** Modificar título
- [ ] **5.3** Clique em **Salvar**
- [ ] **5.4** Mensagem: "Página atualizada com sucesso"
- [ ] **5.5** Título atualizado na lista

### 📋 Fase 6: Testar Publicação (2 minutos)

- [ ] **6.1** Selecionar página
- [ ] **6.2** Marcar **Publicar página** (checkbox)
- [ ] **6.3** Clique em **Salvar**
- [ ] **6.4** Ícone olho verde aparece na página (publicada)
- [ ] **6.5** Acessar URL pública: `/teste`
- [ ] **6.6** Página visível publicados

### 📋 Fase 7: Testar Erro (Validação)

#### Teste 1: Arquivo muito grande

- [ ] **7.1** Tentar fazer upload de imagem > 10MB
- [ ] **7.2** Toast erro: "Arquivo muito grande"
- [ ] **7.3** Imagem não enviada

#### Teste 2: Arquivo não-imagem

- [ ] **7.4** Tentar fazer upload de arquivo.txt
- [ ] **7.5** Toast erro: "Arquivo deve ser uma imagem"
- [ ] **7.6** Arquivo não enviado

#### Teste 3: Slug obrigatório

- [ ] **7.7** Deixar slug vazio
- [ ] **7.8** Botão **Salvar** fica cinzento (desativado)

### 📋 Fase 8: Testes Avançados (Opcional)

#### Teste 1: Remover imagem

- [ ] **8.1** Clicar X no preview do banner
- [ ] **8.2** Imagem removida do formulário
- [ ] **8.3** Salvar
- [ ] **8.4** Confirmar que bannerUrl = null no banco

#### Teste 2: Atualizar imagem

- [ ] **8.5** Fazer upload de nova imagem em página existente
- [ ] **8.6** Nova imagem substitui antiga
- [ ] **8.7** Preview atualizado
- [ ] **8.8** Salvar
- [ ] **8.9** Nova URL persiste

#### Teste 3: Deletar página

- [ ] **8.10** Selecionar página
- [ ] **8.11** Clique em **Remover**
- [ ] **8.12** Confirmar deleção
- [ ] **8.13** Página desaparece da lista
- [ ] **8.14** Imagens removidas do Supabase (opcional)

### 📋 Fase 9: Validação Final

- [ ] **9.1** Todas as fases completadas ✅
- [ ] **9.2** Nenhum erro no console (F12)
- [ ] **9.3** Imagens servindo via URL Supabase
- [ ] **9.4** Páginas salvando corretamente
- [ ] **9.5** Sistema pronto para produção

---

## 📊 Matriz de Status

| Fase      | Tarefa            | Status | Data | Obs |
| --------- | ----------------- | ------ | ---- | --- |
| 1         | Setup Supabase    | ⏳     |      |     |
| 2         | Políticas RLS     | ⏳     |      |     |
| 3         | Verificar Install | ⏳     |      |     |
| 4.1-4.5   | Criar Página      | ⏳     |      |     |
| 4.6-4.10  | Upload Banner     | ⏳     |      |     |
| 4.11-4.12 | Upload Ícone      | ⏳     |      |     |
| 4.13-4.16 | Salvar Página     | ⏳     |      |     |
| 4.17-4.25 | Verificar Banco   | ⏳     |      |     |
| 5         | Testar Edição     | ⏳     |      |     |
| 6         | Testar Publicação | ⏳     |      |     |
| 7         | Testar Validação  | ⏳     |      |     |
| 8         | Testes Avançados  | ⏳     |      |     |
| 9         | Validação Final   | ⏳     |      |     |

**Legenda:**

- ⏳ Pendente
- ✅ Concluído
- ❌ Erro
- ⚠️ Aviso

---

## 🆘 Troubleshooting Rápido

### ❌ "Bucket 'public-pages' not found"

- [ ] Verificar em Storage → Buckets se bucket existe
- [ ] Confirmar nome exato: `public-pages`
- [ ] Recarregar página

### ❌ "Forbidden (403)"

- [ ] Verificar se políticas RLS foram criadas
- [ ] Confirmar que usuário está autenticado (ADMIN)
- [ ] Reexecutar script `setup-public-pages-bucket.sql`

### ❌ "File too large"

- [ ] Reduzir tamanho da imagem
- [ ] Usar ferramenta de compressão
- [ ] Aumentar `maxSize` em `ImageUpload.tsx` (opcional)

### ❌ "Imagem não aparece"

- [ ] Aguardar alguns segundos
- [ ] Abrir console (F12) para ver erros
- [ ] Verificar se URL do Supabase está correta
- [ ] Confirmar que bucket é público

### ❌ "Página não salva"

- [ ] Verificar se slug está preenchido
- [ ] Verificar se título está preenchido
- [ ] Abrir console para ver erro detalhado
- [ ] Verificar conexão com banco de dados

---

## 📞 Documentação Relacionada

- 📄 `UPLOAD_IMAGENS_COMPLETO.md` - Guia completo com recursos
- 📄 `UPLOAD_RESUMO_EXECUTIVO.md` - Visão geral da solução
- 📄 `setup-public-pages-bucket.sql` - Script SQL para RLS

---

**Tempo Total Estimado:** 20-30 minutos

Bom upload! 🚀
