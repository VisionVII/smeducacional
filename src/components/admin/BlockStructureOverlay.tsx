/**
 * Componente de overlay de estrutura ao hover
 * Mostra hierarquia visual dos blocos ao passar o mouse
 */
'use client';

import { Block } from '@/components/ui/BlockEditor';
import { cn } from '@/lib/utils';
import {
  Type,
  Image as ImageIcon,
  MousePointer,
  List,
  Video,
  Layout,
  Edit2,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
} from 'lucide-react';

interface BlockStructureOverlayProps {
  block: Block;
  index: number;
  totalBlocks: number;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isHovered: boolean;
}

/**
 * Retorna ícone e label baseado no tipo do bloco
 */
function getBlockMeta(block: Block) {
  switch (block.type) {
    case 'text':
      return {
        icon: Type,
        label: 'Texto',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500',
      };
    case 'image':
      return {
        icon: ImageIcon,
        label: 'Imagem',
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500',
      };
    case 'button':
      return {
        icon: MousePointer,
        label: 'Botão',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500',
      };
    case 'list':
      return {
        icon: List,
        label: 'Lista',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500',
      };
    case 'video':
      return {
        icon: Video,
        label: 'Vídeo',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500',
      };
    case 'section':
      return {
        icon: Layout,
        label: 'Seção',
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500',
      };
    default:
      return {
        icon: Type,
        label: 'Bloco',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500',
      };
  }
}

/**
 * Obtém preview do conteúdo do bloco
 */
function getBlockPreview(block: Block): string {
  switch (block.type) {
    case 'text':
      const preview = block.value?.substring(0, 50) || '';
      return preview.length > 50 ? preview + '...' : preview;
    case 'image':
      return block.alt || block.src?.split('/').pop() || 'Sem descrição';
    case 'button':
      return block.label || 'Sem texto';
    case 'list':
      return `${block.items?.length || 0} itens`;
    case 'video':
      return block.title || block.url || 'Sem título';
    case 'section':
      return `${block.blocks?.length || 0} blocos internos`;
    default:
      return 'Conteúdo';
  }
}

export function BlockStructureOverlay({
  block,
  index,
  totalBlocks,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isHovered,
}: BlockStructureOverlayProps) {
  const meta = getBlockMeta(block);
  const Icon = meta.icon;
  const preview = getBlockPreview(block);

  if (!isHovered) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 border-2 rounded-lg pointer-events-none z-10 transition-all',
        meta.borderColor,
        meta.bgColor
      )}
    >
      {/* Badge com tipo e número do bloco */}
      <div
        className={cn(
          'absolute -top-3 left-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg pointer-events-auto',
          'bg-background border-2',
          meta.borderColor,
          meta.color
        )}
      >
        <Icon className="w-3 h-3" />
        <span>
          {meta.label} #{index + 1}
        </span>
      </div>

      {/* Preview do conteúdo */}
      <div
        className={cn(
          'absolute top-2 left-2 right-2 px-3 py-2 rounded-md text-xs bg-background/95 border shadow-sm',
          'truncate pointer-events-none',
          meta.borderColor
        )}
      >
        <span className="text-muted-foreground">{preview}</span>
      </div>

      {/* Toolbar de ações */}
      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
        {/* Mover para cima */}
        {onMoveUp && index > 0 && (
          <button
            onClick={onMoveUp}
            className="p-2 bg-background border-2 border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950 transition shadow-lg"
            title="Mover para cima"
          >
            <MoveUp className="w-3 h-3 text-blue-600" />
          </button>
        )}

        {/* Editar */}
        <button
          onClick={onEdit}
          className="p-2 bg-background border-2 border-green-500 rounded-full hover:bg-green-50 dark:hover:bg-green-950 transition shadow-lg"
          title="Editar bloco"
        >
          <Edit2 className="w-3 h-3 text-green-600" />
        </button>

        {/* Duplicar */}
        <button
          onClick={onDuplicate}
          className="p-2 bg-background border-2 border-purple-500 rounded-full hover:bg-purple-50 dark:hover:bg-purple-950 transition shadow-lg"
          title="Duplicar bloco"
        >
          <Copy className="w-3 h-3 text-purple-600" />
        </button>

        {/* Deletar */}
        <button
          onClick={onDelete}
          className="p-2 bg-background border-2 border-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-950 transition shadow-lg"
          title="Remover bloco"
        >
          <Trash2 className="w-3 h-3 text-red-600" />
        </button>

        {/* Mover para baixo */}
        {onMoveDown && index < totalBlocks - 1 && (
          <button
            onClick={onMoveDown}
            className="p-2 bg-background border-2 border-blue-500 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950 transition shadow-lg"
            title="Mover para baixo"
          >
            <MoveDown className="w-3 h-3 text-blue-600" />
          </button>
        )}
      </div>

      {/* Indicador de seção com blocos internos */}
      {block.type === 'section' && block.blocks && block.blocks.length > 0 && (
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-background/95 border rounded text-xs font-medium shadow-sm pointer-events-none">
          <Layout className="w-3 h-3 inline mr-1" />
          {block.blocks.length} blocos
        </div>
      )}
    </div>
  );
}

/**
 * Componente de indicador de estrutura da página completa
 * Exibe hierarquia em miniatura ao lado da preview
 */
interface PageStructureMapProps {
  blocks: Block[];
  onSelectBlock?: (index: number) => void;
  onBlockClick?: (index: number) => void; // fallback para versões antigas
  selectedBlockIndex: number | null;
}

export function PageStructureMap({
  blocks,
  onSelectBlock,
  onBlockClick,
  selectedBlockIndex,
}: PageStructureMapProps) {
  const handleSelectBlock = onSelectBlock ?? onBlockClick;

  return (
    <div className="w-64 bg-muted/30 border-l p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Layout className="w-4 h-4" />
        Estrutura da Página
      </h3>
      <div className="space-y-2">
        {blocks.map((block, index) => {
          const meta = getBlockMeta(block);
          const Icon = meta.icon;
          const isSelected = selectedBlockIndex === index;

          return (
            <button
              key={block.id}
              onClick={() => handleSelectBlock?.(index)}
              className={cn(
                'w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md',
                isSelected
                  ? cn('border-primary bg-primary/10 shadow-sm')
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-start gap-2">
                <Icon
                  className={cn('w-4 h-4 mt-0.5 flex-shrink-0', meta.color)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium flex items-center gap-1">
                    {meta.label} #{index + 1}
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-1">
                    {getBlockPreview(block)}
                  </div>
                </div>
              </div>

              {/* Blocos internos de seção */}
              {block.type === 'section' &&
                block.blocks &&
                block.blocks.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-dashed border-muted-foreground/30 space-y-1">
                    {block.blocks.map((innerBlock, innerIndex) => {
                      const innerMeta = getBlockMeta(innerBlock);
                      const InnerIcon = innerMeta.icon;
                      return (
                        <div
                          key={innerBlock.id}
                          className="text-xs flex items-center gap-1 text-muted-foreground"
                        >
                          <InnerIcon className="w-3 h-3" />
                          <span>
                            {innerMeta.label} #{innerIndex + 1}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
            </button>
          );
        })}

        {blocks.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-8">
            Nenhum bloco ainda
          </div>
        )}
      </div>
    </div>
  );
}
