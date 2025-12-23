'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BlockRenderer } from '@/components/ui/BlockRenderer';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Search,
  ExternalLink,
  Layout,
  Sparkles,
  Type,
  Image as ImageIcon,
  MousePointer,
  List,
  Video,
} from 'lucide-react';
import {
  PageHeaderEditor,
  BlockEditDialog,
  HeaderEditDialog,
} from '@/components/admin/PublicPageEditor';
import { Block } from '@/components/ui/BlockEditor';
import {
  BlockStructureOverlay,
  PageStructureMap,
} from './BlockStructureOverlay';
import { TEMPLATE_LIST, PageTemplate } from '@/lib/page-templates';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  bannerUrl: string | null;
  iconUrl: string | null;
  content: Block[] | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export default function PublicPagesDashboard() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showStructureMap, setShowStructureMap] = useState(true);

  // Edição inline - Elementor style
  const [headerHovered, setHeaderHovered] = useState(false);
  const [editingHeader, setEditingHeader] = useState<
    'title' | 'description' | 'bannerUrl' | 'iconUrl' | null
  >(null);
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(
    null
  );
  const [hoveredBlockIndex, setHoveredBlockIndex] = useState<number | null>(
    null
  );

  // Form state (rascunho/draft)
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    bannerUrl: '',
    iconUrl: '',
    content: [] as Block[],
    isPublished: false,
  });

  // Fetch todas as páginas
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['admin-public-pages'],
    queryFn: async () => {
      const res = await fetch('/api/admin/public-pages');
      if (!res.ok) throw new Error('Erro ao carregar páginas');
      return res.json();
    },
  });

  const pages: PublicPage[] = pagesData?.data || [];
  const selectedPage = pages.find((p) => p.id === selectedPageId);

  // Detectar mudanças não salvas
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (!selectedPage || isCreating) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges =
      formData.title !== selectedPage.title ||
      formData.slug !== selectedPage.slug ||
      formData.description !== (selectedPage.description || '') ||
      formData.bannerUrl !== (selectedPage.bannerUrl || '') ||
      formData.iconUrl !== (selectedPage.iconUrl || '') ||
      formData.isPublished !== selectedPage.isPublished ||
      JSON.stringify(formData.content) !==
        JSON.stringify(selectedPage.content || []);

    setHasUnsavedChanges(hasChanges);
  }, [formData, selectedPage, isCreating]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S = Salvar
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (selectedPageId || isCreating) {
          handleSave();
        }
      }
      // Escape = Fechar dialogs
      if (e.key === 'Escape') {
        setEditingHeader(null);
        setEditingBlockIndex(null);
        setShowTemplateDialog(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId, isCreating]);

  // Carregar dados da página ao selecionar
  useEffect(() => {
    if (selectedPage && !isCreating) {
      // Usar requestAnimationFrame para evitar cascading renders
      const raf = requestAnimationFrame(() => {
        setFormData({
          slug: selectedPage.slug,
          title: selectedPage.title,
          description: selectedPage.description || '',
          bannerUrl: selectedPage.bannerUrl || '',
          iconUrl: selectedPage.iconUrl || '',
          content: Array.isArray(selectedPage.content)
            ? selectedPage.content
            : [],
          isPublished: selectedPage.isPublished,
        });
      });

      return () => cancelAnimationFrame(raf);
    }
  }, [selectedPage, isCreating]);

  // Detectar mudanças não salvas
  useEffect(() => {
    if (!selectedPage || isCreating) {
      setHasUnsavedChanges(false);
      return;
    }

    const hasChanges =
      formData.title !== selectedPage.title ||
      formData.slug !== selectedPage.slug ||
      formData.description !== (selectedPage.description || '') ||
      formData.bannerUrl !== (selectedPage.bannerUrl || '') ||
      formData.iconUrl !== (selectedPage.iconUrl || '') ||
      formData.isPublished !== selectedPage.isPublished ||
      JSON.stringify(formData.content) !==
        JSON.stringify(selectedPage.content || []);

    setHasUnsavedChanges(hasChanges);
  }, [formData, selectedPage, isCreating]);

  // Criar página
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/public-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao criar página');
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-public-pages'] });
      toast({ title: 'Página criada com sucesso!' });
      setIsCreating(false);
      setSelectedPageId(data.data.id);
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    },
  });

  // Atualizar página
  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!selectedPageId) throw new Error('Nenhuma página selecionada');
      const res = await fetch(`/api/admin/public-pages/${selectedPageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erro ao atualizar página');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-public-pages'] });
      toast({ title: 'Página atualizada com sucesso!' });
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    },
  });

  // Deletar página
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/public-pages/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Erro ao deletar página');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-public-pages'] });
      toast({ title: 'Página removida!' });
      setSelectedPageId(null);
      resetForm();
    },
    onError: (error: Error) => {
      toast({ title: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      slug: '',
      title: '',
      description: '',
      bannerUrl: '',
      iconUrl: '',
      content: [],
      isPublished: false,
    });
  };

  const handleSave = () => {
    // Validações
    if (!formData.title.trim()) {
      toast({
        title: 'Título obrigatório',
        description: 'Por favor, preencha o título da página',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.slug.trim()) {
      toast({
        title: 'Slug obrigatório',
        description: 'Por favor, preencha o slug da página (ex: sobre-nos)',
        variant: 'destructive',
      });
      return;
    }

    // Validar slug (apenas letras minúsculas, números e hífens)
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(formData.slug)) {
      toast({
        title: 'Slug inválido',
        description:
          'Use apenas letras minúsculas, números e hífens (ex: sobre-nos)',
        variant: 'destructive',
      });
      return;
    }

    if (isCreating) {
      createMutation.mutate(formData);
    } else if (selectedPageId) {
      updateMutation.mutate(formData);
    }
  };

  const handleNewPage = () => {
    setShowTemplateDialog(true);
  };

  const handleCreateFromTemplate = (template: PageTemplate) => {
    setIsCreating(true);
    setSelectedPageId(null);
    setFormData({
      slug: template.slug,
      title: template.title,
      description: template.description,
      bannerUrl: '',
      iconUrl: '',
      content: template.blocks,
      isPublished: false,
    });
    setShowTemplateDialog(false);
    toast({
      title: `Template "${template.title}" carregado! ✨`,
      description: 'Personalize os blocos e salve quando pronto.',
    });
  };

  const handleSelectPage = (pageId: string) => {
    setIsCreating(false);
    setSelectedPageId(pageId);
  };

  const handleDelete = () => {
    if (!selectedPageId) return;

    const pageName = selectedPage?.title || 'esta página';
    const isPublished = selectedPage?.isPublished;

    const confirmMessage = isPublished
      ? `⚠️ ATENÇÃO: A página "${pageName}" está PUBLICADA!\n\nRemover esta página tornará o link /${selectedPage?.slug} inacessível.\n\nTem certeza que deseja continuar?`
      : `Tem certeza que deseja remover "${pageName}"?`;

    if (confirm(confirmMessage)) {
      deleteMutation.mutate(selectedPageId);
    }
  };

  const handleSaveHeader = (newValue: string) => {
    if (!editingHeader) return;
    setFormData((prev) => ({
      ...prev,
      [editingHeader]: newValue,
    }));
    setEditingHeader(null);
  };

  const handleSaveBlock = (block: Block) => {
    if (editingBlockIndex === null) return;
    const newContent = [...formData.content];
    newContent[editingBlockIndex] = block;
    setFormData((prev) => ({
      ...prev,
      content: newContent,
    }));
    setEditingBlockIndex(null);
  };

  const handleDuplicateBlock = (index: number) => {
    const block = formData.content[index];
    const timestamp = new Date().getTime();
    const duplicated = {
      ...block,
      id: `${block.id}-copy-${timestamp}`,
    };
    const newContent = [...formData.content];
    newContent.splice(index + 1, 0, duplicated);
    setFormData((prev) => ({ ...prev, content: newContent }));
    toast({ title: 'Bloco duplicado!' });
  };

  const handleDeleteBlock = (index: number) => {
    const block = formData.content[index];
    const blockName =
      block.type === 'section' && 'title' in block
        ? `seção "${block.title}"`
        : `bloco ${block.type}`;

    if (confirm(`Remover ${blockName}?`)) {
      const newContent = formData.content.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, content: newContent }));
      toast({
        title: 'Bloco removido!',
        description: `${
          blockName.charAt(0).toUpperCase() + blockName.slice(1)
        } foi removido`,
      });
    }
  };

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const newContent = [...formData.content];
    [newContent[index - 1], newContent[index]] = [
      newContent[index],
      newContent[index - 1],
    ];
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  const handleMoveBlockDown = (index: number) => {
    if (index === formData.content.length - 1) return;
    const newContent = [...formData.content];
    [newContent[index], newContent[index + 1]] = [
      newContent[index + 1],
      newContent[index],
    ];
    setFormData((prev) => ({ ...prev, content: newContent }));
  };

  const handleAddBlock = (type: Block['type']) => {
    const timestamp = new Date().getTime();
    let newBlock: Block;

    switch (type) {
      case 'text':
        newBlock = {
          id: `block-${timestamp}`,
          type: 'text',
          value: 'Novo texto',
        };
        break;
      case 'image':
        newBlock = {
          id: `block-${timestamp}`,
          type: 'image',
          src: '',
          alt: '',
        };
        break;
      case 'button':
        newBlock = {
          id: `block-${timestamp}`,
          type: 'button',
          label: 'Clique aqui',
          url: '#',
        };
        break;
      case 'list':
        newBlock = {
          id: `block-${timestamp}`,
          type: 'list',
          items: ['Item 1'],
          ordered: false,
        };
        break;
      case 'video':
        newBlock = {
          id: `block-${timestamp}`,
          type: 'video',
          url: '',
          title: '',
        };
        break;
      case 'section':
        newBlock = {
          id: `block-${timestamp}`,
          type: 'section',
          title: 'Nova Seção',
          blocks: [],
        };
        break;
      default:
        return;
    }

    setFormData((prev) => ({
      ...prev,
      content: [...prev.content, newBlock],
    }));
    toast({ title: `Bloco "${type}" adicionado!` });
  };

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const previewUrl = selectedPage ? `/${selectedPage.slug}` : '/';
  const liveBlocks = Array.isArray(formData.content) ? formData.content : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[300px,1fr] h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* Sidebar - Lista de Páginas */}
      <div className="border-r bg-muted/30 flex flex-col min-h-full min-w-[260px] xl:min-w-[300px]">
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar página"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-sm"
            />
          </div>
          <Button onClick={handleNewPage} className="w-full" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Página
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <p className="text-center text-muted-foreground text-xs py-8">
              Carregando...
            </p>
          ) : filteredPages.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs py-8">
              Nenhuma página
            </p>
          ) : (
            <div className="space-y-1">
              {filteredPages.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handleSelectPage(page.id)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    selectedPageId === page.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <div className="font-medium truncate">{page.title}</div>
                  <p className="text-xs opacity-70">/{page.slug}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {page.isPublished ? (
                      <>
                        <Eye className="h-3 w-3" />
                        <span className="text-xs">Publicada</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-3 w-3" />
                        <span className="text-xs">Rascunho</span>
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor - Página Editável */}
      <div className="flex bg-background min-h-full overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="border-b bg-muted/30 p-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div>
                <h2 className="font-bold flex items-center gap-2">
                  {isCreating ? (
                    <>
                      <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                      Nova Página
                    </>
                  ) : selectedPageId ? (
                    <>
                      <span>Editando: {formData.title || 'Sem título'}</span>
                      {selectedPage?.isPublished && (
                        <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                          Publicada
                        </span>
                      )}
                    </>
                  ) : (
                    'Selecione uma página'
                  )}
                </h2>
                {selectedPage && (
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                    <span>
                      Última atualização:{' '}
                      {new Date(selectedPage.updatedAt).toLocaleString('pt-BR')}
                    </span>
                    <span>•</span>
                    <span>{liveBlocks.length} blocos</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle estrutura */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStructureMap(!showStructureMap)}
                title={
                  showStructureMap
                    ? 'Ocultar mapa de estrutura'
                    : 'Mostrar mapa de estrutura'
                }
              >
                <Layout className="h-4 w-4 mr-2" />
                {showStructureMap ? 'Ocultar' : 'Mostrar'} Estrutura
              </Button>

              {/* Toggle publicação */}
              {(selectedPageId || isCreating) && (
                <Button
                  variant={formData.isPublished ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublished: !prev.isPublished,
                    }))
                  }
                  title={
                    formData.isPublished
                      ? 'Despublicar página'
                      : 'Publicar página'
                  }
                >
                  {formData.isPublished ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Publicada
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Rascunho
                    </>
                  )}
                </Button>
              )}

              {selectedPageId && !isCreating && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  title="Remover página permanentemente"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMutation.isPending ? 'Removendo...' : 'Remover'}
                </Button>
              )}

              {selectedPageId && selectedPage?.isPublished && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(previewUrl, '_blank')}
                  title="Abrir página publicada em nova aba"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Publicada
                </Button>
              )}

              {selectedPageId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(`/preview/${selectedPageId}`, '_blank')
                  }
                  title="Abrir preview do rascunho em nova aba"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ver Rascunho
                </Button>
              )}

              <Button
                onClick={handleSave}
                size="sm"
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  (!selectedPageId && !isCreating)
                }
                title={
                  hasUnsavedChanges
                    ? 'Salvar alterações (Ctrl+S)'
                    : 'Nenhuma alteração'
                }
                className={cn(
                  'font-semibold transition-all',
                  hasUnsavedChanges && 'animate-pulse bg-primary'
                )}
                variant={hasUnsavedChanges ? 'default' : 'outline'}
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending || updateMutation.isPending
                  ? 'Salvando...'
                  : hasUnsavedChanges
                  ? 'Salvar Alterações *'
                  : 'Salvo'}
              </Button>
            </div>
          </div>

          {/* Página Editável (Elementor-style) */}
          <div className="flex-1 overflow-y-auto">
            {!selectedPageId && !isCreating ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium mb-2">Selecione uma página</p>
                  <p className="text-sm">
                    ou crie uma nova para começar a editar
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto p-8 space-y-6">
                {/* Campos Rápidos (Slug e Status) */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        Slug da Página (URL)
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">/</span>
                        <Input
                          value={formData.slug}
                          onChange={(e) => {
                            const slug = e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, '-')
                              .replace(/-+/g, '-')
                              .replace(/^-|-$/g, '');
                            setFormData((prev) => ({ ...prev, slug }));
                          }}
                          placeholder="sobre-nos"
                          className="flex-1 text-sm font-mono"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Use apenas letras, números e hífens
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                        URL Completa
                      </label>
                      <div className="flex items-center gap-2 bg-background rounded-md border px-3 py-2">
                        <code className="text-sm text-muted-foreground flex-1 truncate">
                          {typeof window !== 'undefined'
                            ? `${window.location.origin}/${
                                formData.slug || 'slug'
                              }`
                            : `/${formData.slug || 'slug'}`}
                        </code>
                        <button
                          onClick={() => {
                            const url =
                              typeof window !== 'undefined'
                                ? `${window.location.origin}/${formData.slug}`
                                : `/${formData.slug}`;
                            navigator.clipboard.writeText(url);
                            toast({ title: 'URL copiada!' });
                          }}
                          className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 rounded transition-colors"
                          title="Copiar URL"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Header Editável */}
                <PageHeaderEditor
                  title={formData.title}
                  description={formData.description}
                  bannerUrl={formData.bannerUrl}
                  iconUrl={formData.iconUrl}
                  onEditTitle={() => setEditingHeader('title')}
                  onEditDescription={() => setEditingHeader('description')}
                  onEditBanner={() => setEditingHeader('bannerUrl')}
                  onEditIcon={() => setEditingHeader('iconUrl')}
                  isHovered={headerHovered}
                  onHoverChange={setHeaderHovered}
                />

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Conteúdo da Página
                    </span>
                  </div>
                </div>

                {/* Blocos de Conteúdo */}
                {liveBlocks.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                    <Plus className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium mb-1">Nenhum bloco ainda</p>
                    <p className="text-sm">
                      Use o botão &quot;+ Adicionar Bloco&quot; abaixo para
                      começar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {liveBlocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="relative"
                        onMouseEnter={() => setHoveredBlockIndex(index)}
                        onMouseLeave={() => setHoveredBlockIndex(null)}
                        onDoubleClick={() => setEditingBlockIndex(index)}
                        title="Clique duplo para editar"
                      >
                        {/* Renderizar bloco */}
                        <div className="rounded-lg border-2 border-transparent hover:border-primary/50 transition-all p-6 bg-card cursor-pointer hover:shadow-md">
                          <BlockRenderer blocks={[block]} />

                          {/* Hint de edição ao hover */}
                          {hoveredBlockIndex === index && (
                            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded shadow-lg">
                              Clique duplo ou use os botões para editar
                            </div>
                          )}
                        </div>

                        {/* Overlay de estrutura ao hover */}
                        <BlockStructureOverlay
                          block={block}
                          index={index}
                          totalBlocks={liveBlocks.length}
                          isHovered={hoveredBlockIndex === index}
                          onEdit={() => setEditingBlockIndex(index)}
                          onDelete={() => handleDeleteBlock(index)}
                          onDuplicate={() => handleDuplicateBlock(index)}
                          onMoveUp={
                            index > 0
                              ? () => handleMoveBlockUp(index)
                              : undefined
                          }
                          onMoveDown={
                            index < liveBlocks.length - 1
                              ? () => handleMoveBlockDown(index)
                              : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Toolbar de Blocos */}
                <div className="sticky bottom-4 left-0 right-0 z-20">
                  <div className="bg-primary text-primary-foreground rounded-lg shadow-2xl p-4 max-w-2xl mx-auto">
                    <p className="text-xs font-semibold mb-3 text-center">
                      Adicionar Novo Bloco
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddBlock('text')}
                      >
                        <Type className="h-3 w-3 mr-1" />
                        Texto
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddBlock('image')}
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Imagem
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddBlock('button')}
                      >
                        <MousePointer className="h-3 w-3 mr-1" />
                        Botão
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddBlock('list')}
                      >
                        <List className="h-3 w-3 mr-1" />
                        Lista
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddBlock('video')}
                      >
                        <Video className="h-3 w-3 mr-1" />
                        Vídeo
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleAddBlock('section')}
                      >
                        <Layout className="h-3 w-3 mr-1" />
                        Seção
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Status do rascunho */}
                <div className="rounded-lg border bg-blue-50 dark:bg-blue-950 p-4 mt-8">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    💡 Você está editando um rascunho
                  </p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mt-1">
                    As alterações não afetam a página publicada. Clique em
                    &quot;Salvar&quot; para confirmar as mudanças.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mapa de Estrutura (sidebar direita) */}
        {showStructureMap && (selectedPageId || isCreating) && (
          <PageStructureMap
            blocks={liveBlocks}
            onSelectBlock={(index) => {
              setHoveredBlockIndex(index);
              setEditingBlockIndex(index);
            }}
            selectedBlockIndex={hoveredBlockIndex}
          />
        )}
      </div>

      {/* Diálogos de Edição */}
      <HeaderEditDialog
        open={editingHeader !== null}
        field={editingHeader}
        value={
          editingHeader === 'title'
            ? formData.title
            : editingHeader === 'description'
            ? formData.description
            : editingHeader === 'bannerUrl'
            ? formData.bannerUrl
            : formData.iconUrl
        }
        onClose={() => setEditingHeader(null)}
        onSave={handleSaveHeader}
      />

      <BlockEditDialog
        key={
          editingBlockIndex !== null
            ? liveBlocks[editingBlockIndex]?.id ?? `new-${editingBlockIndex}`
            : 'closed'
        }
        open={editingBlockIndex !== null}
        blockIndex={editingBlockIndex}
        block={
          editingBlockIndex !== null ? liveBlocks[editingBlockIndex] : null
        }
        onClose={() => setEditingBlockIndex(null)}
        onSave={handleSaveBlock}
      />

      {/* Dialog de Templates */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Escolha um Template
            </DialogTitle>
            <DialogDescription>
              Selecione um template pré-definido para começar rapidamente
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {TEMPLATE_LIST.map((template) => (
              <button
                key={template.slug}
                onClick={() => handleCreateFromTemplate(template)}
                className="text-left border-2 rounded-lg p-4 hover:border-primary transition-all hover:shadow-lg group"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{template.meta.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {template.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.meta.previewDescription}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="px-2 py-0.5 bg-muted rounded">
                        {template.blocks.length} blocos
                      </span>
                      <span className="px-2 py-0.5 bg-muted rounded capitalize">
                        {template.meta.category}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
