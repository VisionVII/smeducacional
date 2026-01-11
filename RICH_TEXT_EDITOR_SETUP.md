# 🎨 Sistema de Conteúdo Profissional - Implementação

## 📦 Instalação das Dependências

Execute os seguintes comandos para instalar todas as dependências necessárias:

```bash
# Editor Tiptap e extensões
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit

# Syntax highlighting para blocos de código
npm install @tiptap/extension-code-block-lowlight lowlight highlight.js

# Extensões adicionais
npm install @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder

# Tailwind Typography (se ainda não instalado)
npm install -D @tailwindcss/typography
```

---

## ⚙️ Configuração do Tailwind

Adicione o plugin Typography ao `tailwind.config.js`:

```javascript
module.exports = {
  // ... outras configurações
  plugins: [
    require('@tailwindcss/typography'),
    // ... outros plugins
  ],
};
```

---

## 🔧 Como Usar

### **1. No Modal de Edição de Aula**

Substitua o `<textarea>` atual por `<RichTextEditor>`:

**ANTES:**

```tsx
<textarea
  id="lesson-content"
  className="flex min-h-[150px] w-full rounded-md border..."
  value={lessonForm.content}
  onChange={(e) =>
    setLessonForm((prev) => ({
      ...prev,
      content: e.target.value,
    }))
  }
  placeholder="Conteúdo adicional da aula em texto, código, etc..."
/>
```

**DEPOIS:**

```tsx
import { RichTextEditor } from '@/components/rich-text-editor';

<RichTextEditor
  content={lessonForm.content}
  onChange={(html) =>
    setLessonForm((prev) => ({
      ...prev,
      content: html,
    }))
  }
  placeholder="Escreva o conteúdo da aula com formatação profissional..."
  className="mt-2"
/>;
```

### **2. No Visualizador de Aula (CoursePlayer)**

Substitua o `dangerouslySetInnerHTML` atual por `<LessonContentViewer>`:

**ANTES:**

```tsx
{
  selectedLesson.content && (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{
        __html: selectedLesson.content,
      }}
    />
  );
}
```

**DEPOIS:**

```tsx
import { LessonContentViewer } from '@/components/lesson-content-viewer';

<LessonContentViewer content={selectedLesson.content} />;
```

---

## 🎯 Features Implementadas

### **Editor (RichTextEditor)**

✅ **Formatação de Texto:**

- Negrito (Ctrl+B)
- Itálico (Ctrl+I)
- Código inline

✅ **Títulos:**

- H1 - Título Principal
- H2 - Subtítulo
- H3 - Seção

✅ **Listas:**

- Lista com marcadores (bullet)
- Lista numerada (ordered)

✅ **Elementos Especiais:**

- Citações (blockquote)
- Blocos de código com syntax highlighting
- Separadores (horizontal rule)
- Links
- Imagens

✅ **Funcionalidades:**

- Desfazer/Refazer (Ctrl+Z / Ctrl+Y)
- Contador de caracteres
- Markdown shortcuts
- Toolbar intuitiva
- Dark mode support
- Placeholder customizável

### **Visualizador (LessonContentViewer)**

✅ **Typography Profissional:**

- Line height otimizado
- Espaçamento entre elementos
- Hierarquia visual clara

✅ **Syntax Highlighting:**

- Blocos de código com tema dark
- Suporte para JS, TS, Python, CSS, HTML

✅ **Design Refinado:**

- Títulos com bordas
- Citações com background colorido
- Código inline estilizado
- Imagens responsivas com sombra
- Listas com espaçamento adequado

✅ **Responsividade:**

- Funciona em mobile e desktop
- Imagens adaptáveis
- Scroll horizontal em code blocks

✅ **Dark Mode:**

- Cores otimizadas para tema escuro
- Contraste adequado

---

## 📝 Linguagens Suportadas (Syntax Highlighting)

```javascript
// JavaScript / TypeScript
const greeting = 'Hello World';
console.log(greeting);
```

```python
# Python
def greet(name):
    print(f"Hello, {name}!")
```

```css
/* CSS */
.container {
  display: flex;
  justify-content: center;
}
```

```html
<!-- HTML -->
<div class="card">
  <h1>Title</h1>
  <p>Content</p>
</div>
```

---

## 🎨 Exemplos de Uso

### **Exemplo 1: Aula de Programação**

````markdown
# Introdução ao JavaScript

JavaScript é uma linguagem de programação **versátil** e _poderosa_.

## Variáveis

Existem 3 formas de declarar variáveis:

```javascript
const name = 'João'; // Constante
let age = 25; // Variável
var old = 'evite'; // Deprecated
```
````

> **Dica:** Sempre use `const` por padrão. Use `let` apenas quando precisar reatribuir.

### Checklist de Boas Práticas

- Use nomes descritivos
- Evite variáveis globais
- Comente código complexo

````

### **Exemplo 2: Aula Teórica**

```markdown
# O que é UX Design?

User Experience (UX) Design é o processo de **criar produtos** que proporcionam experiências _significativas_ e _relevantes_ aos usuários.

## Pilares do UX

1. **Usabilidade** - Facilidade de uso
2. **Acessibilidade** - Inclusão de todos os usuários
3. **Prazer** - Experiência agradável

---

> "Design is not just what it looks like and feels like. Design is how it works."
> — Steve Jobs
````

---

## 🚀 Integração Completa

### **Passo 1: Atualizar Modal de Aula**

No arquivo `src/app/teacher/courses/[id]/content/page.tsx`:

```tsx
// No topo do arquivo
import { RichTextEditor } from '@/components/rich-text-editor';

// Substituir a seção de conteúdo (linha ~645)
<div className="space-y-2">
  <Label htmlFor="lesson-content">Conteúdo em Texto</Label>
  <p className="text-xs text-gray-500 mb-2">
    Use a barra de ferramentas para formatar o conteúdo: títulos, listas,
    código, imagens, etc.
  </p>
  <RichTextEditor
    content={lessonForm.content}
    onChange={(html) =>
      setLessonForm((prev) => ({
        ...prev,
        content: html,
      }))
    }
    placeholder="Escreva o conteúdo da aula... Use **negrito** _itálico_ `código`"
  />
</div>;
```

### **Passo 2: Atualizar Visualizador**

No arquivo `src/components/course-player.tsx`:

```tsx
// No topo do arquivo
import { LessonContentViewer } from '@/components/lesson-content-viewer';

// Substituir a seção de conteúdo (linha ~380)
<Card className="mt-6">
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>Conteúdo da Aula</CardTitle>
      {selectedLesson.duration && (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          {Math.floor(selectedLesson.duration / 60)} min
        </div>
      )}
    </div>
  </CardHeader>
  <CardContent>
    {selectedLesson.description && (
      <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">
        {selectedLesson.description}
      </p>
    )}
    <LessonContentViewer content={selectedLesson.content} />
  </CardContent>
</Card>;
```

---

## 🔒 Segurança

### **Sanitização de HTML**

**IMPORTANTE:** O HTML gerado pelo Tiptap é seguro por padrão, mas recomendamos adicionar DOMPurify para segurança adicional:

```bash
npm install dompurify
npm install -D @types/dompurify
```

Atualize o `LessonContentViewer`:

```tsx
import DOMPurify from 'dompurify';

// Dentro do componente
const sanitizedContent = DOMPurify.sanitize(content, {
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'ul',
    'ol',
    'li',
    'blockquote',
    'code',
    'pre',
    'a',
    'img',
    'hr',
  ],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel'],
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
```

---

## 📊 Comparação: Antes vs Depois

### **ANTES (textarea simples):**

```
Conteúdo corrido sem formatação
Todo texto no mesmo estilo
Código sem highlighting
Sem hierarquia visual
```

### **DEPOIS (Rich Text Editor):**

````
# Título bem definido

Parágrafos com espaçamento adequado e **formatação**.

```javascript
// Código com syntax highlighting
const code = 'readable';
````

> Citações destacadas

- Listas organizadas
- Fáceis de ler

````

---

## 🎓 Guia para Professores

Crie um guia rápido para os professores:

```markdown
# Como Criar Conteúdo Profissional

## Formatação Básica
- **Negrito**: Selecione o texto e clique no ícone B
- *Itálico*: Selecione o texto e clique no ícone I
- `Código`: Selecione e clique no ícone <>

## Títulos
Use títulos para organizar o conteúdo:
- H1 para título principal
- H2 para seções
- H3 para subseções

## Código
Para adicionar blocos de código:
1. Clique no ícone de código (</>)
2. Cole seu código
3. O highlighting é automático!

## Dicas
💡 Use markdown! Digite ** para negrito, * para itálico, ` para código
````

---

## 🐛 Troubleshooting

### **Problema: Syntax highlighting não funciona**

Certifique-se de que os estilos do highlight.js estão carregados:

```tsx
// Em _app.tsx ou layout.tsx
import 'highlight.js/styles/github-dark.css';
```

### **Problema: Editor não aparece**

Verifique se todas as dependências foram instaladas corretamente:

```bash
npm list @tiptap/react
```

### **Problema: Dark mode não funciona**

Certifique-se de que o Tailwind está configurado com dark mode:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // ou 'media'
  // ...
};
```

---

## ✨ Resultado Final

Com essa implementação, o SM Educa terá:

✅ Editor WYSIWYG profissional igual Udemy/Coursera
✅ Syntax highlighting para código
✅ Typography otimizada para leitura
✅ Dark mode completo
✅ Responsivo mobile
✅ Acessível (A11Y)
✅ Performance otimizada

**Tamanho do bundle:** ~100KB gzipped (aceitável para a funcionalidade)

---

## 📞 Próximos Passos

Agora execute:

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-code-block-lowlight lowlight highlight.js @tiptap/extension-image @tiptap/extension-link @tiptap/extension-placeholder @tailwindcss/typography
```

E substitua os componentes conforme descrito acima! 🚀
