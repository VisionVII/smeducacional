import type { SyntheticEvent } from 'react';
import Image from 'next/image';

import { Block } from './BlockEditor';

const FALLBACK_IMAGE_SRC =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="18"%3EImagem n%C3%A3o encontrada%3C/text%3E%3C/svg%3E';

interface BlockRendererProps {
  blocks: Block[];
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        switch (block.type) {
          case 'text':
            if (!block.value || !block.value.trim()) {
              return (
                <div
                  key={block.id}
                  className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/30"
                >
                  📝 Adicione texto para visualizar aqui
                </div>
              );
            }
            return (
              <div
                key={block.id}
                className="prose dark:prose-invert max-w-none"
              >
                {block.value}
              </div>
            );

          case 'image':
            // Evita renderizar imagens com src vazio, o que gera erro de download da página
            if (!block.src || !block.src.trim()) {
              return (
                <div
                  key={block.id}
                  className="p-8 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/30"
                >
                  <div className="text-4xl mb-2">🖼️</div>
                  <p className="font-medium">Nenhuma imagem selecionada</p>
                  <p className="text-xs mt-1">
                    Clique para editar e fazer upload
                  </p>
                </div>
              );
            }
            return (
              <div key={block.id} className="flex justify-center">
                <Image
                  src={block.src}
                  alt={block.alt || ''}
                  width={800}
                  height={600}
                  className="rounded shadow max-w-full h-auto"
                  loading="lazy"
                  unoptimized
                  onError={(event: SyntheticEvent<HTMLImageElement>) => {
                    event.currentTarget.src = FALLBACK_IMAGE_SRC;
                  }}
                />
              </div>
            );

          case 'button': {
            if (!block.label || !block.label.trim()) {
              return (
                <div
                  key={block.id}
                  className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/30"
                >
                  🔘 Adicione um texto ao botão
                </div>
              );
            }
            let btnClass =
              'inline-block px-4 py-2 rounded font-semibold transition';
            if (block.variant === 'outline') {
              btnClass +=
                ' border border-primary text-primary bg-transparent hover:bg-primary/10';
            } else if (block.variant === 'link') {
              btnClass += ' underline text-primary bg-transparent px-0 py-0';
            } else {
              btnClass += ' bg-primary text-white hover:bg-primary/90';
            }
            return (
              <div key={block.id} className="flex justify-center">
                <a
                  href={block.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={btnClass}
                >
                  {block.label}
                </a>
              </div>
            );
          }

          case 'list':
            if (!block.items || block.items.length === 0) {
              return (
                <div
                  key={block.id}
                  className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/30"
                >
                  📋 Adicione itens à lista (um por linha)
                </div>
              );
            }
            return block.ordered ? (
              <ol
                key={block.id}
                className="list-decimal list-inside pl-4 space-y-1"
              >
                {block.items.map((item, i) => (
                  <li key={i} className="text-sm">
                    {item}
                  </li>
                ))}
              </ol>
            ) : (
              <ul
                key={block.id}
                className="list-disc list-inside pl-4 space-y-1"
              >
                {block.items.map((item, i) => (
                  <li key={i} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            );

          case 'section':
            if (!block.title || !block.title.trim()) {
              return (
                <div
                  key={block.id}
                  className="p-4 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/30"
                >
                  📂 Adicione um título à seção
                </div>
              );
            }
            return (
              <section
                key={block.id}
                className="border-l-4 border-primary pl-6 py-2"
              >
                <h2 className="text-xl font-bold mb-4">{block.title}</h2>
                <BlockRenderer blocks={block.blocks} />
              </section>
            );

          case 'video': {
            const rawUrl = block.url?.trim();
            if (!rawUrl) {
              return (
                <div
                  key={block.id}
                  className="p-8 border-2 border-dashed rounded-lg text-center text-sm text-muted-foreground bg-muted/30"
                >
                  <div className="text-4xl mb-2">🎥</div>
                  <p className="font-medium">Nenhum vídeo configurado</p>
                  <p className="text-xs mt-1">
                    Informe uma URL de vídeo (YouTube ou Vimeo) para
                    pré-visualizar.
                  </p>
                </div>
              );
            }

            let embedUrl = '';
            if (rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be')) {
              const match = rawUrl.match(/(?:youtu\.be\/|v=)([\w-]+)/);
              const id = match ? match[1] : '';
              embedUrl = id ? `https://www.youtube.com/embed/${id}` : rawUrl;
            } else if (rawUrl.includes('vimeo.com')) {
              const match = rawUrl.match(/vimeo.com\/(\d+)/);
              const id = match ? match[1] : '';
              embedUrl = id ? `https://player.vimeo.com/video/${id}` : rawUrl;
            } else {
              embedUrl = rawUrl;
            }

            return (
              <div key={block.id} className="flex flex-col items-center">
                {block.title && (
                  <div className="mb-2 font-semibold">{block.title}</div>
                )}
                <div className="aspect-video w-full max-w-2xl bg-black/10 rounded overflow-hidden">
                  <iframe
                    src={embedUrl}
                    title={block.title || 'Vídeo'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full min-h-[300px]"
                    frameBorder={0}
                  />
                </div>
              </div>
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
