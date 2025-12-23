import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type Block =
  | { id: string; type: 'text'; value: string }
  | { id: string; type: 'image'; src: string; alt?: string }
  | {
      id: string;
      type: 'button';
      label: string;
      url: string;
      variant?: 'default' | 'outline' | 'link';
    }
  | { id: string; type: 'list'; items: string[]; ordered?: boolean }
  | { id: string; type: 'video'; url: string; title?: string }
  | { id: string; type: 'section'; title: string; blocks: Block[] };

export interface BlockEditorProps {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ value, onChange }: BlockEditorProps) {
  // Garantir que value sempre seja um array
  const blocks = Array.isArray(value) ? value : [];

  const handleBlockChange = (idx: number, newBlock: Block) => {
    const newBlocks = [...blocks];
    newBlocks[idx] = newBlock;
    onChange(newBlocks);
  };
  const handleRemoveBlock = (idx: number) => {
    const newBlocks = blocks.filter((_, i) => i !== idx);
    onChange(newBlocks);
  };
  const handleAddBlock = (type: Block['type']) => {
    let newBlock: Block;
    switch (type) {
      case 'text':
        newBlock = { id: crypto.randomUUID(), type: 'text', value: '' };
        break;
      case 'image':
        newBlock = { id: crypto.randomUUID(), type: 'image', src: '', alt: '' };
        break;
      case 'button':
        newBlock = {
          id: crypto.randomUUID(),
          type: 'button',
          label: '',
          url: '',
          variant: 'default',
        };
        break;
      case 'list':
        newBlock = {
          id: crypto.randomUUID(),
          type: 'list',
          items: [''],
          ordered: false,
        };
        break;
      case 'video':
        newBlock = {
          id: crypto.randomUUID(),
          type: 'video',
          url: '',
          title: '',
        };
        break;
      case 'section':
        newBlock = {
          id: crypto.randomUUID(),
          type: 'section',
          title: '',
          blocks: [],
        };
        break;
      default:
        return;
    }
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'text':
            return (
              <div key={block.id} className="border rounded p-3 bg-muted/50">
                <Textarea
                  value={block.value}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, value: e.target.value })
                  }
                  placeholder="Texto"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveBlock(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          case 'image':
            return (
              <div key={block.id} className="border rounded p-3 bg-muted/50">
                <Input
                  value={block.src}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, src: e.target.value })
                  }
                  placeholder="URL da imagem"
                />
                <Input
                  value={block.alt || ''}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, alt: e.target.value })
                  }
                  placeholder="Texto alternativo"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveBlock(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          case 'video':
            return (
              <div key={block.id} className="border rounded p-3 bg-muted/50">
                <Input
                  value={block.url}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, url: e.target.value })
                  }
                  placeholder="URL do vídeo (YouTube, Vimeo, etc)"
                />
                <Input
                  value={block.title || ''}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, title: e.target.value })
                  }
                  placeholder="Título do vídeo (opcional)"
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveBlock(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          case 'button':
            return (
              <div key={block.id} className="border rounded p-3 bg-muted/50">
                <Input
                  value={block.label}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, label: e.target.value })
                  }
                  placeholder="Texto do botão"
                />
                <Input
                  value={block.url}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, url: e.target.value })
                  }
                  placeholder="URL do botão"
                />
                <select
                  className="border rounded px-2 py-1"
                  value={block.variant || 'default'}
                  onChange={(e) =>
                    handleBlockChange(idx, {
                      ...block,
                      variant: e.target.value as 'default' | 'outline' | 'link',
                    })
                  }
                >
                  <option value="default">Padrão</option>
                  <option value="outline">Contorno</option>
                  <option value="link">Link</option>
                </select>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveBlock(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          case 'list':
            return (
              <div key={block.id} className="border rounded p-3 bg-muted/50">
                <label className="block text-xs mb-1">Itens da lista</label>
                {block.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-1">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...block.items];
                        newItems[i] = e.target.value;
                        handleBlockChange(idx, { ...block, items: newItems });
                      }}
                      placeholder={`Item ${i + 1}`}
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const newItems = block.items.filter((_, j) => j !== i);
                        handleBlockChange(idx, { ...block, items: newItems });
                      }}
                    >
                      -
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  onClick={() =>
                    handleBlockChange(idx, {
                      ...block,
                      items: [...block.items, ''],
                    })
                  }
                >
                  + Item
                </Button>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={!!block.ordered}
                    onChange={(e) =>
                      handleBlockChange(idx, {
                        ...block,
                        ordered: e.target.checked,
                      })
                    }
                    id={`ordered-${block.id}`}
                  />
                  <label htmlFor={`ordered-${block.id}`}>Lista ordenada</label>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveBlock(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          case 'section':
            return (
              <div key={block.id} className="border rounded p-3 bg-muted/50">
                <Input
                  value={block.title}
                  onChange={(e) =>
                    handleBlockChange(idx, { ...block, title: e.target.value })
                  }
                  placeholder="Título da seção"
                />
                <BlockEditor
                  value={block.blocks}
                  onChange={(newBlocks) =>
                    handleBlockChange(idx, { ...block, blocks: newBlocks })
                  }
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveBlock(idx)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
      <div className="flex gap-2 mt-2">
        <Button size="sm" onClick={() => handleAddBlock('text')}>
          + Texto
        </Button>
        <Button size="sm" onClick={() => handleAddBlock('image')}>
          + Imagem
        </Button>
        <Button size="sm" onClick={() => handleAddBlock('button')}>
          + Botão
        </Button>
        <Button size="sm" onClick={() => handleAddBlock('list')}>
          + Lista
        </Button>
        <Button size="sm" onClick={() => handleAddBlock('video')}>
          + Vídeo
        </Button>
        <Button size="sm" onClick={() => handleAddBlock('section')}>
          + Seção
        </Button>
      </div>
    </div>
  );
}
