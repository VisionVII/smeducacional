'use client';

import { cn } from '@/lib/utils';
import { FileText } from 'lucide-react';

interface LessonContentViewerProps {
  content: string | null;
  className?: string;
}

export function LessonContentViewer({
  content,
  className,
}: LessonContentViewerProps) {
  if (!content || content.trim() === '' || content === '<p></p>') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
        <FileText className="h-12 w-12 mb-3 text-gray-400" />
        <p className="text-sm">Nenhum conteúdo de texto disponível</p>
        <p className="text-xs mt-1 text-gray-400">
          O instrutor não adicionou material escrito para esta aula
        </p>
      </div>
    );
  }

  return (
    <div className={cn('lesson-content-viewer', className)}>
      <div
        className={cn(
          // Base prose
          'prose prose-lg dark:prose-invert max-w-none',

          // Headings
          'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:tracking-tight',
          'prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:pb-3 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-800',
          'prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-100 dark:prose-h2:border-gray-900',
          'prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6',
          'prose-h4:text-xl prose-h4:mb-2 prose-h4:mt-4',

          // Paragraphs
          'prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-5 prose-p:text-lg',

          // Links
          'prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-a:transition-colors',

          // Strong & Em
          'prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-semibold',
          'prose-em:italic prose-em:text-gray-800 dark:prose-em:text-gray-200',

          // Code (inline)
          'prose-code:text-pink-600 dark:prose-code:text-pink-400',
          'prose-code:bg-pink-50 dark:prose-code:bg-pink-900/20',
          'prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono',
          'prose-code:before:content-[""] prose-code:after:content-[""]',
          'prose-code:border prose-code:border-pink-200 dark:prose-code:border-pink-800',

          // Pre & Code Blocks
          'prose-pre:bg-gray-900 dark:prose-pre:bg-black',
          'prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:p-6',
          'prose-pre:overflow-x-auto prose-pre:shadow-2xl',
          'prose-pre:border prose-pre:border-gray-800 dark:prose-pre:border-gray-700',
          'prose-pre:my-6',
          '[&_pre_code]:text-gray-100 [&_pre_code]:bg-transparent [&_pre_code]:p-0',
          '[&_pre_code]:border-0 [&_pre_code]:text-sm [&_pre_code]:leading-relaxed',

          // Blockquotes
          'prose-blockquote:border-l-4 prose-blockquote:border-blue-500 dark:prose-blockquote:border-blue-400',
          'prose-blockquote:pl-6 prose-blockquote:pr-4 prose-blockquote:py-3',
          'prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-400',
          'prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-blue-950/30',
          'prose-blockquote:rounded-r-lg prose-blockquote:my-6',
          'prose-blockquote:shadow-sm',

          // Lists
          'prose-ul:list-disc prose-ul:pl-8 prose-ul:mb-6 prose-ul:space-y-3',
          'prose-ol:list-decimal prose-ol:pl-8 prose-ol:mb-6 prose-ol:space-y-3',
          'prose-li:text-gray-700 dark:prose-li:text-gray-300 prose-li:text-lg prose-li:leading-relaxed',
          'prose-li:pl-2',

          // Nested lists
          '[&_ul_ul]:mt-2 [&_ul_ul]:mb-2',
          '[&_ol_ol]:mt-2 [&_ol_ol]:mb-2',
          '[&_li>ul]:list-circle',
          '[&_li>ol]:list-lower-alpha',

          // Images
          'prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-8',
          'prose-img:border prose-img:border-gray-200 dark:prose-img:border-gray-800',

          // Horizontal Rule
          'prose-hr:my-12 prose-hr:border-gray-300 dark:prose-hr:border-gray-700 prose-hr:border-t-2',

          // Tables (se necessário no futuro)
          'prose-table:border-collapse prose-table:w-full',
          'prose-thead:bg-gray-100 dark:prose-thead:bg-gray-900',
          'prose-th:border prose-th:border-gray-300 dark:prose-th:border-gray-700 prose-th:p-3',
          'prose-td:border prose-td:border-gray-300 dark:prose-td:border-gray-700 prose-td:p-3'
        )}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* Warning Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-start gap-3 text-xs text-gray-500 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
        <span className="text-lg">⚠️</span>
        <div className="flex-1">
          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            Conteúdo fornecido pelo instrutor
          </p>
          <p className="leading-relaxed">
            Todo o material apresentado nesta aula foi criado e é de
            responsabilidade exclusiva do instrutor do curso. A plataforma não
            se responsabiliza pelo conteúdo gerado por terceiros.
          </p>
        </div>
      </div>
    </div>
  );
}
