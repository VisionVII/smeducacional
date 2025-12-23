'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Edit2 } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';
import type { Block } from '@/components/ui/BlockEditor';

interface PageHeaderEditorProps {
  title: string;
  description: string;
  bannerUrl: string;
  iconUrl: string;
  onEditTitle: () => void;
  onEditDescription: () => void;
  onEditBanner: () => void;
  onEditIcon: () => void;
  isHovered: boolean;
  onHoverChange: (hovered: boolean) => void;
}

export function PageHeaderEditor({
  title,
  description,
  bannerUrl,
  iconUrl,
  onEditTitle,
  onEditDescription,
  onEditBanner,
  onEditIcon,
  isHovered,
  onHoverChange,
}: PageHeaderEditorProps) {
  return (
    <div
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      className="relative group"
    >
      <div className="relative overflow-hidden rounded-xl border bg-gradient-to-b from-muted/40 to-card shadow-sm">
        {bannerUrl ? (
          <div className="h-64 w-full bg-black/5 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerUrl}
              alt="Banner"
              className="h-full w-full object-cover"
            />
            {isHovered && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2">
                <button
                  onClick={onEditBanner}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={onEditBanner}
            className="h-64 w-full flex items-center justify-center text-sm text-muted-foreground px-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div>
              <p className="font-medium mb-1">+ Adicionar Banner</p>
              <p className="text-xs">Otimizado para SEO/AEO (1600x900px)</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-start gap-4">
        {iconUrl && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={iconUrl}
              alt="Ícone"
              className="w-14 h-14 rounded-lg border bg-white object-cover shadow-sm"
            />
            {isHovered && (
              <button
                onClick={onEditIcon}
                className="absolute -top-2 -right-2 p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1">
          <div className="relative group/title">
            <h1 className="text-2xl font-bold">{title}</h1>
            {isHovered && (
              <button
                onClick={onEditTitle}
                className="absolute -top-1 -right-10 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md opacity-0 group-hover/title:opacity-100 transition-opacity"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>

          {description && (
            <div className="relative group/desc">
              <p className="text-muted-foreground mt-1">{description}</p>
              {isHovered && (
                <button
                  onClick={onEditDescription}
                  className="absolute -top-1 -right-10 p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md opacity-0 group-hover/desc:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {!iconUrl && isHovered && (
            <button
              onClick={onEditIcon}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              + Adicionar ícone
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface BlockEditDialogProps {
  open: boolean;
  blockIndex: number | null;
  block: Block | null;
  onClose: () => void;
  onSave: (block: Block) => void;
}

export function BlockEditDialog({
  open,
  blockIndex,
  block,
  onClose,
  onSave,
}: BlockEditDialogProps) {
  const [editedBlock, setEditedBlock] = useState<Block | null>(() =>
    block ? JSON.parse(JSON.stringify(block)) : null
  );

  if (!open || !block) return null;

  const current: Block = editedBlock ?? block;

  const handleSave = () => {
    onSave(current);
    onClose();
  };

  // Helper function to safely update block
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateBlock = (updates: Partial<Block> & Record<string, any>) => {
    setEditedBlock({ ...current, ...updates } as Block);
  };

  return (
    <Dialog
      key={block?.id || (blockIndex !== null ? `new-${blockIndex}` : 'new')}
      open={open}
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Bloco #{blockIndex !== null ? blockIndex + 1 : 'novo'}
          </DialogTitle>
          <DialogDescription>
            Modifique o conteúdo deste bloco. As alterações aparecerão
            imediatamente na prévia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo de Bloco
            </label>
            <p className="text-sm text-muted-foreground capitalize">
              {current.type}
            </p>
          </div>

          {current.type === 'text' && 'value' in current && (
            <div>
              <label className="block text-sm font-medium mb-2">Texto</label>
              <Textarea
                value={current.value || ''}
                onChange={(e) => updateBlock({ value: e.target.value })}
                placeholder="Digite o texto"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {'value' in current ? current.value?.length || 0 : 0} caracteres
              </p>
            </div>
          )}

          {current.type === 'image' && 'src' in current && (
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">Imagem</label>
              {'src' in current && current.src && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                  <p className="text-xs font-medium mb-2">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={'src' in current ? current.src : ''}
                    alt={
                      'alt' in current ? current.alt || 'Preview' : 'Preview'
                    }
                    className="max-h-48 rounded border mx-auto"
                  />
                </div>
              )}
              <ImageUpload
                value={'src' in current ? current.src || '' : ''}
                onChange={(url) => updateBlock({ src: url })}
                bucket="images"
                maxSizeMB={10}
              />
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Texto Alternativo
                </label>
                <Input
                  value={'alt' in current ? current.alt || '' : ''}
                  onChange={(e) => updateBlock({ alt: e.target.value })}
                  placeholder="Descrição da imagem (importante para SEO)"
                />
              </div>
            </div>
          )}

          {current.type === 'button' && 'label' in current && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Texto do Botão
                </label>
                <Input
                  value={'label' in current ? current.label || '' : ''}
                  onChange={(e) => updateBlock({ label: e.target.value })}
                  placeholder="Ex: Saiba Mais"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Texto que aparecerá no botão
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Link</label>
                <Input
                  value={'url' in current ? current.url || '' : ''}
                  onChange={(e) => updateBlock({ url: e.target.value })}
                  placeholder="https://exemplo.com"
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL de destino (use https://)
                </p>
              </div>
            </>
          )}

          {current.type === 'list' && 'items' in current && (
            <div>
              <label className="block text-sm font-medium mb-2">Items</label>
              <Textarea
                value={('items' in current ? current.items || [] : []).join(
                  '\n'
                )}
                onChange={(e) =>
                  updateBlock({
                    items: e.target.value.split('\n').filter(Boolean),
                  })
                }
                placeholder="Um item por linha"
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {'items' in current ? current.items?.length || 0 : 0} itens
              </p>
              <div className="mt-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={
                      'ordered' in current ? current.ordered || false : false
                    }
                    onChange={(e) => updateBlock({ ordered: e.target.checked })}
                  />
                  <span className="text-sm">Lista ordenada</span>
                </label>
              </div>
            </div>
          )}

          {current.type === 'video' && 'url' in current && (
            <div className="space-y-4">
              <label className="block text-sm font-medium mb-2">
                URL do Vídeo
              </label>
              <Input
                value={
                  'url' in current && current.type === 'video'
                    ? current.url || ''
                    : ''
                }
                onChange={(e) => updateBlock({ url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                Suporta YouTube, Vimeo e links diretos
              </p>
            </div>
          )}

          {current.type === 'section' && 'title' in current && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Título da Seção
                </label>
                <Input
                  value={'title' in current ? current.title || '' : ''}
                  onChange={(e) => updateBlock({ title: e.target.value })}
                  placeholder="Ex: Nossos Serviços"
                />
              </div>
              <p className="text-sm text-muted-foreground border-l-4 border-primary/50 pl-3 py-2">
                Seções contêm outros blocos. Use para organizar conteúdo em
                grupos.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar Alterações</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface HeaderEditDialogProps {
  open: boolean;
  field: 'title' | 'description' | 'bannerUrl' | 'iconUrl' | null;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
}

export function HeaderEditDialog({
  open,
  field,
  value,
  onClose,
  onSave,
}: HeaderEditDialogProps) {
  const [editedValue, setEditedValue] = useState(value);

  const handleSave = () => {
    onSave(editedValue);
    onClose();
  };

  const getFieldLabel = () => {
    switch (field) {
      case 'title':
        return 'Título da Página';
      case 'description':
        return 'Descrição';
      case 'bannerUrl':
        return 'Banner';
      case 'iconUrl':
        return 'Ícone';
      default:
        return 'Campo';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        key={`${field || 'field'}-${open ? 'open' : 'closed'}`}
        className="max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle>Editar {getFieldLabel()}</DialogTitle>
          <DialogDescription>
            Modifique o conteúdo e clique em salvar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {field === 'bannerUrl' || field === 'iconUrl' ? (
            <>
              {editedValue && (
                <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                  <p className="text-xs font-medium mb-2">Preview:</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editedValue}
                    alt="Preview"
                    className={`rounded border mx-auto ${
                      field === 'iconUrl' ? 'w-20 h-20' : 'max-h-48'
                    }`}
                  />
                </div>
              )}
              <ImageUpload
                value={editedValue}
                onChange={setEditedValue}
                bucket="images"
                maxSizeMB={field === 'bannerUrl' ? 10 : 2}
              />
            </>
          ) : field === 'description' ? (
            <>
              <Textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                placeholder="Descreva a página..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {editedValue.length} caracteres
              </p>
            </>
          ) : (
            <>
              <Input
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                placeholder={`Digite o ${getFieldLabel().toLowerCase()}`}
              />
              <p className="text-xs text-muted-foreground">
                {editedValue.length} caracteres
              </p>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
