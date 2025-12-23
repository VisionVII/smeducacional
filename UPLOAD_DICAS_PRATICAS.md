## 💡 DICAS PRÁTICAS: Usando o Sistema de Upload

### 🎨 Tamanhos Recomendados de Imagem

#### Banner (Hero Section)

```
Tamanho ideal:    1920 x 1080 px
Compressão:       80-90% qualidade
Peso máximo:      500KB - 1MB
Formatos:         JPG (melhor para fotos), WebP (melhor qualidade)
Razão de aspecto: 16:9 (paisagem)
```

#### Ícone/Logo

```
Tamanho ideal:    200 x 200 px a 400 x 400 px
Compressão:       95%+ qualidade
Peso máximo:      50-100KB
Formatos:         PNG (com alpha), SVG (escalável)
Razão de aspecto: 1:1 (quadrado) ou 4:3
```

### 📸 Como Otimizar Imagens

#### Ferramenta 1: TinyPNG (Online)

1. Abra https://tinypng.com
2. Arraste sua imagem
3. Clique em download
4. Comprimida até 80% do tamanho original

#### Ferramenta 2: ImageMagick (CLI)

```bash
# Redimensionar e comprimir
convert entrada.jpg -resize 1920x1080 -quality 85 saida.jpg

# Converter para WebP (mais compressão)
convert entrada.jpg -quality 85 saida.webp
```

#### Ferramenta 3: VS Code Extension

- Instale: "Image Optimizer"
- Clique direito em imagem → Optimize
- Automático!

### 🖼️ Dimensões Recomendadas

```
┌─────────────────────────────────┐
│     PÁGINA PÚBLICA              │
├─────────────────────────────────┤
│                                 │
│     ┌──────────────────────┐   │
│     │  BANNER: 1920x1080   │   │ ← Hero section
│     │  (máx 1MB)           │   │
│     └──────────────────────┘   │
│                                 │
│     Título da Página            │
│     Descrição...                │
│                                 │
│     ┌──┐  ┌──┐  ┌──┐          │
│     │IC│  │IC│  │IC│          │ ← Ícones: 200x200px
│     └──┘  └──┘  └──┘          │
│                                 │
│     Blocos de conteúdo...       │
│                                 │
│     ┌──────────────────────┐   │
│     │  Botão de CTA        │   │
│     └──────────────────────┘   │
│                                 │
└─────────────────────────────────┘
```

### 🎯 Casos de Uso

#### Exemplo 1: Página de Sobre

```
Banner:  Logo ou imagem do time (1920x1080)
Ícone:   Logo da empresa (400x400)
Blocos:  Histórico, missão, valores
```

#### Exemplo 2: Página de Produto

```
Banner:  Imagem principal do produto (1920x1080)
Ícone:   Ícone do produto (200x200)
Blocos:  Descrição, features, benefícios
```

#### Exemplo 3: Página de Serviços

```
Banner:  Imagem da equipe ou escritório (1920x1080)
Ícone:   Ícone do serviço (200x200)
Blocos:  Descrição, processo, depoimentos
```

### 🔄 Fluxo de Publicação

```
1. Preparar imagens (otimizar tamanho)
   ↓
2. Acessar /admin/public-pages
   ↓
3. Criar página
   ↓
4. Fazer upload de banner
   ↓
5. Fazer upload de ícone
   ↓
6. Adicionar conteúdo em blocos
   ↓
7. Marcar "Publicar página"
   ↓
8. Salvar
   ↓
9. Visualizar em /{slug}
   ↓
✅ Página ao vivo!
```

### ⚡ Atalhos Produtivos

#### Atalho 1: Arrastar Múltiplas Imagens

```
// Suporta apenas uma por vez
// Solução: Fazer upload uma por uma
```

#### Atalho 2: Usar Imagem de URL (Não Recomendado)

```javascript
// ANTES (problema):
// Editar manualmente a URL no banco
// ❌ Não funciona mais (campo removido)

// AGORA (solução):
// Fazer upload do arquivo
// ✅ URL gerada automaticamente
```

#### Atalho 3: Reutilizar Imagem

```
1. Copie URL da imagem anterior (em PublicPage)
2. Nova página → Editar → Paste na URL
❌ Isso não funciona mais!

✅ SOLUÇÃO CORRETA:
1. Fazer upload novamente
2. Ou: Usar imagem já armazenada no Supabase
```

### 📱 Responsividade de Imagens

As imagens são exibidas assim:

**Banner:**

```css
/* Imagem responsiva */
max-width: 100%;
height: auto;
aspect-ratio: 16/9; /* Mantém proporção */
```

**Ícone:**

```css
/* Ícone responsivo */
width: 100%;
max-width: 200px;
height: auto;
```

### 🎨 Integração com Blocos

As imagens podem ser usadas em blocos de conteúdo também:

```tsx
// No BlockEditor, você pode adicionar bloco de imagem:
{
  type: 'image',
  url: 'https://supabase...image.jpg',
  alt: 'Descrição da imagem',
  caption: 'Legenda (opcional)'
}
```

### 🔍 Verificar Status de Upload

**No navegador (F12):**

```javascript
// Network tab:
// 1. Clique em imagem
// 2. Veja requisição POST em /api/upload
// 3. Resposta deve ter: { url: "https://..." }

// Console:
// Procure por erros de upload
// console.log(erro)
```

### 🚨 Solução de Problemas Rápida

| Problema                | Causa                   | Solução               |
| ----------------------- | ----------------------- | --------------------- |
| "Upload lento"          | Internet lenta          | Comprimir imagem      |
| "Imagem pixelada"       | Tamanho pequeno         | Usar imagem maior     |
| "URL não salva"         | Erro no banco           | Verificar console F12 |
| "Imagem não visível"    | RLS bloqueando          | Reexecutar setup SQL  |
| "Botão salvar cinzento" | Campo obrigatório vazio | Preencher slug/título |

### 💰 Custos Supabase

```
Armazenamento: Grátis até 1GB
Transferência: Grátis até 5GB/mês
Upload: Sem limite
Plano Free é suficiente para começar!
```

### 🎓 Boas Práticas

✅ **Faça:**

- Comprimir imagens antes de upload
- Usar nomes descritivos para imagens
- Testar em diferentes dispositivos
- Fazer backup das imagens

❌ **Não faça:**

- Fazer upload de imagens muito grandes (>10MB)
- Usar imagens de baixa qualidade
- Confiar em URL externa (copiar/colar)
- Deletar imagens sem backup

### 🎬 Exemplo Completo

**Passo a Passo: Criar Página de Portfólio**

1. **Preparar:**

   ```bash
   # 1. Comprimir imagens
   # Portfolio-banner.jpg → 800KB
   # Portfolio-icone.png → 50KB
   ```

2. **Upload:**

   ```
   - Acessar /admin/public-pages
   - Nova Página
   - Slug: meu-portfolio
   - Título: Meu Portfólio
   - Banner upload: portfolio-banner.jpg
   - Ícone upload: portfolio-icone.png
   ```

3. **Conteúdo (blocos):**

   ```
   - Bloco texto: "Bem-vindo ao meu portfólio"
   - Bloco lista: Projetos realizados
   - Bloco imagem: Exemplos de trabalho
   - Bloco botão: "Ver meus projetos"
   ```

4. **Publicar:**

   ```
   - Marcar "Publicar página"
   - Salvar
   - Acessar /meu-portfolio
   ```

5. **Resultado:**
   ```
   ✅ Página ao vivo
   ✅ Imagens carregadas
   ✅ Responsiva em mobile
   ✅ SEO otimizado
   ```

### 📊 Monitoramento

**Verificar Performance:**

```javascript
// No console do navegador:
// 1. Abrir DevTools (F12)
// 2. Network tab
// 3. Carregar página
// 4. Procurar por requisições de imagem
// 5. Verificar:
//    - Tempo de carregamento: < 2s (ideal)
//    - Tamanho: < 500KB (banner), < 100KB (ícone)
//    - Status: 200 OK
```

---

**Dúvidas?** Consulte a documentação completa em `UPLOAD_IMAGENS_COMPLETO.md`

Boa sorte! 🚀
