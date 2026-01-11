'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { createLowlight } from 'lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import python from 'highlight.js/lib/languages/python';
import css from 'highlight.js/lib/languages/css';
import html from 'highlight.js/lib/languages/xml';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Link as LinkIcon,
  ImageIcon,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Create lowlight instance
const lowlight = createLowlight();

// Register languages for syntax highlighting
lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('python', python);
lowlight.register('css', css);
lowlight.register('html', html);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Comece a escrever o conteúdo da aula...',
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use lowlight instead
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto mx-auto shadow-md',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg dark:prose-invert max-w-none',
          'focus:outline-none min-h-[300px] px-4 py-3',
          'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white',
          'prose-h1:text-3xl prose-h1:mb-4 prose-h1:mt-6',
          'prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-5',
          'prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-4',
          'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4',
          'prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold',
          'prose-code:text-pink-600 dark:prose-code:text-pink-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-[""] prose-code:after:content-[""]',
          'prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto prose-pre:shadow-lg',
          'prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-900/20 prose-blockquote:py-2 prose-blockquote:my-4',
          'prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4 prose-ul:space-y-2',
          'prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4 prose-ol:space-y-2',
          'prose-li:text-gray-700 dark:prose-li:text-gray-300',
          'prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto prose-img:my-6',
          'prose-hr:my-8 prose-hr:border-gray-300 dark:prose-hr:border-gray-700'
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('URL do link:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('URL da imagem:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<Bold className="h-4 w-4" />}
            tooltip="Negrito (Ctrl+B)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<Italic className="h-4 w-4" />}
            tooltip="Itálico (Ctrl+I)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            icon={<Code className="h-4 w-4" />}
            tooltip="Código Inline"
          />
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            isActive={editor.isActive('heading', { level: 1 })}
            icon={<Heading1 className="h-4 w-4" />}
            tooltip="Título 1"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            isActive={editor.isActive('heading', { level: 2 })}
            icon={<Heading2 className="h-4 w-4" />}
            tooltip="Título 2"
          />
          <ToolbarButton
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            isActive={editor.isActive('heading', { level: 3 })}
            icon={<Heading3 className="h-4 w-4" />}
            tooltip="Título 3"
          />
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<List className="h-4 w-4" />}
            tooltip="Lista com marcadores"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<ListOrdered className="h-4 w-4" />}
            tooltip="Lista numerada"
          />
        </div>

        {/* Other */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<Quote className="h-4 w-4" />}
            tooltip="Citação"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={<Code className="h-5 w-5" />}
            tooltip="Bloco de código"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            icon={<Minus className="h-4 w-4" />}
            tooltip="Separador"
          />
        </div>

        {/* Links & Images */}
        <div className="flex gap-1 border-r pr-2">
          <ToolbarButton
            onClick={addLink}
            isActive={editor.isActive('link')}
            icon={<LinkIcon className="h-4 w-4" />}
            tooltip="Adicionar link"
          />
          <ToolbarButton
            onClick={addImage}
            icon={<ImageIcon className="h-4 w-4" />}
            tooltip="Adicionar imagem"
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <ToolbarButton
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={<Undo className="h-4 w-4" />}
            tooltip="Desfazer (Ctrl+Z)"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={<Redo className="h-4 w-4" />}
            tooltip="Refazer (Ctrl+Y)"
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-950">
        <EditorContent editor={editor} />
      </div>

      {/* Character Count */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t px-4 py-2 text-xs text-gray-500 flex justify-between">
        <span>
          {editor.storage.characterCount?.characters() || 0} caracteres
        </span>
        <span className="text-gray-400">
          💡 Dica: Use Markdown! **negrito** _itálico_ `código`
        </span>
      </div>
    </div>
  );
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tooltip: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  icon,
  tooltip,
}: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={cn(
        'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors',
        'disabled:opacity-30 disabled:cursor-not-allowed',
        isActive && 'bg-gray-300 dark:bg-gray-700'
      )}
    >
      {icon}
    </button>
  );
}
