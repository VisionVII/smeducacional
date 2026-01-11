# 📝 Sistema de Conteúdo Profissional - Proposta Enterprise

## 🎯 Análise: Como Big Techs fazem E-Learning

### **Udemy / Coursera / Hotmart / Eduzz**

**Características Comuns:**

1. **Editor Rico (WYSIWYG)** - What You See Is What You Get

   - Formatação de texto (negrito, itálico, sublinhado)
   - Títulos e subtítulos (H1, H2, H3)
   - Listas numeradas e com marcadores
   - Links e citações
   - Blocos de código com syntax highlighting
   - Imagens inline
   - Vídeos embarcados

2. **Visualização Estilizada**

   - Typography profissional (line-height, letter-spacing)
   - Hierarquia visual clara
   - Código com syntax highlighting
   - Imagens responsivas
   - Espaçamento entre elementos
   - Dark mode support

3. **UX para Professor**

   - Preview em tempo real
   - Toolbar intuitiva
   - Atalhos de teclado
   - Auto-save
   - Markdown support opcional

4. **UX para Aluno**
   - Leitura confortável
   - Copiar código facilmente
   - Navegação por headings
   - Imprimir/PDF friendly

---

## 🛠️ Solução Proposta: Três Opções

### **OPÇÃO 1: Tiptap Editor (RECOMENDADA)** ⭐⭐⭐⭐⭐

**Por quê:**

- ✅ Usado por Notion, GitLab, Substack
- ✅ Open source, mantido ativamente
- ✅ Framework agnostic (funciona com React)
- ✅ Extensível e customizável
- ✅ Syntax highlighting built-in
- ✅ Markdown shortcuts
- ✅ Dark mode support
- ✅ Colaboração em tempo real (opcional)

**Exemplo de uso:**

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { lowlight } from 'lowlight';

const editor = useEditor({
  extensions: [
    StarterKit,
    CodeBlockLowlight.configure({
      lowlight,
    }),
  ],
  content: '<p>Hello World!</p>',
});

return <EditorContent editor={editor} />;
```

**Dependências:**

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
npm install @tiptap/extension-code-block-lowlight lowlight
npm install @tiptap/extension-image @tiptap/extension-link
```

**Vantagens:**

- 📦 ~100KB gzipped
- 🎨 Totalmente customizável
- 🔌 Extensões para tudo
- 📱 Mobile friendly
- ♿ Acessível (A11Y)

**Desvantagens:**

- Curva de aprendizado média
- Configuração inicial necessária

---

### **OPÇÃO 2: Quill.js** ⭐⭐⭐⭐

**Por quê:**

- ✅ Usado por LinkedIn, Salesforce
- ✅ API simples e direta
- ✅ Temas prontos (Snow, Bubble)
- ✅ Módulos para código, imagem, vídeo
- ✅ Delta format (JSON)
- ✅ Muito estável

**Exemplo de uso:**

```tsx
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
  syntax: true,
};

return (
  <ReactQuill
    theme="snow"
    value={value}
    onChange={setValue}
    modules={modules}
  />
);
```

**Dependências:**

```bash
npm install react-quill quill
npm install highlight.js
```

**Vantagens:**

- 📦 ~80KB gzipped
- 🎨 Temas prontos
- 📖 Documentação excelente
- 🚀 Setup rápido

**Desvantagens:**

- Menos flexível que Tiptap
- Customização CSS mais trabalhosa

---

### **OPÇÃO 3: Lexical (Meta)** ⭐⭐⭐⭐⭐

**Por quê:**

- ✅ Criado pelo Meta (Facebook)
- ✅ Usado no Facebook, Instagram
- ✅ Performance excepcional
- ✅ Colaboração em tempo real nativa
- ✅ TypeScript first
- ✅ Extensível

**Exemplo de uso:**

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';

const editorConfig = {
  namespace: 'MyEditor',
  theme: {
    // Customize theme
  },
  onError: (error: Error) => console.error(error),
};

return (
  <LexicalComposer initialConfig={editorConfig}>
    <RichTextPlugin
      contentEditable={<ContentEditable />}
      placeholder={<div>Start typing...</div>}
    />
  </LexicalComposer>
);
```

**Dependências:**

```bash
npm install lexical @lexical/react
npm install @lexical/code @lexical/list @lexical/link
```

**Vantagens:**

- 📦 ~50KB gzipped (mais leve!)
- ⚡ Performance excepcional
- 🔮 Futuro-proof (Meta)
- 🤝 Colaboração real-time

**Desvantagens:**

- Curva de aprendizado mais alta
- Comunidade menor (mais novo)
- Documentação em evolução

---

## 🎨 Design System para Visualização

Independente do editor escolhido, precisamos de CSS profissional para exibir o conteúdo:

### **Prose (Tailwind Typography)**

```tsx
<div
  className="prose prose-lg dark:prose-invert max-w-none
  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
  prose-h1:text-4xl prose-h1:mb-4 prose-h1:mt-8
  prose-h2:text-3xl prose-h2:mb-3 prose-h2:mt-6
  prose-h3:text-2xl prose-h3:mb-2 prose-h3:mt-4
  prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
  prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
  prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold
  prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
  prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto
  prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400
  prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
  prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
  prose-li:mb-2
  prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
  prose-hr:my-8 prose-hr:border-gray-300 dark:prose-hr:border-gray-700"
  dangerouslySetInnerHTML={{ __html: content }}
/>
```

---

## 🚀 Recomendação Final

### **Para SM Educa: Tiptap + Tailwind Typography**

**Justificativa:**

1. **Tiptap** é o mais equilibrado:

   - ✅ Flexível como Lexical
   - ✅ Simples como Quill
   - ✅ Mantido ativamente
   - ✅ Comunidade grande

2. **Tailwind Typography** para exibição:

   - ✅ Já usamos Tailwind no projeto
   - ✅ Dark mode automático
   - ✅ Responsivo

3. **Features que vamos implementar:**
   - ✅ Negrito, itálico, sublinhado
   - ✅ Headings (H1, H2, H3)
   - ✅ Listas (ordered, unordered)
   - ✅ Blocos de código com highlighting
   - ✅ Links
   - ✅ Citações (blockquote)
   - ✅ Imagens
   - ✅ Separadores (hr)
   - ✅ Markdown shortcuts
   - ✅ Toolbar customizada

---

## 📋 Plano de Implementação

### **FASE 1: Setup (1-2h)**

1. Instalar dependências Tiptap
2. Criar componente `RichTextEditor`
3. Criar componente `LessonContentViewer`
4. Testar dark mode

### **FASE 2: Integração (2-3h)**

1. Substituir textarea no modal de aula
2. Atualizar API para aceitar HTML
3. Sanitizar HTML (DOMPurify)
4. Atualizar visualização no CoursePlayer

### **FASE 3: Melhorias (1-2h)**

1. Adicionar syntax highlighting
2. Implementar auto-save
3. Adicionar contador de palavras
4. Preview em tempo real

### **FASE 4: Polish (1h)**

1. Ícones na toolbar
2. Tooltips
3. Atalhos de teclado
4. Documentação para professores

---

## 💰 Comparação de Tamanho

| Editor  | Bundle Size | Setup Time | Curva Aprendizado |
| ------- | ----------- | ---------- | ----------------- |
| Tiptap  | ~100KB      | 1-2h       | Média             |
| Quill   | ~80KB       | 30min      | Baixa             |
| Lexical | ~50KB       | 2-3h       | Alta              |

---

## 🎯 Decisão

**VAMOS COM TIPTAP!**

Vou implementar agora:

1. ✅ Componente `RichTextEditor` com Tiptap
2. ✅ Componente `LessonContentViewer` com Prose
3. ✅ Integração no modal de aula
4. ✅ Visualização profissional no CoursePlayer

Próxima mensagem: Código pronto! 🚀
