'use client';

import { useState, useEffect, useCallback } from 'react';
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
  Monitor,
  Tablet,
  Smartphone,
  Menu,
  X,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
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
// Select components removidos por não uso

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

type ViewportMode = 'desktop' | 'tablet' | 'mobile';
type LayoutMode = 'edit' | 'preview';

export default function PublicPagesDashboard() {
  const queryClient = useQueryClient();
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showStructureMap, setShowStructureMap] = useState(true);

  // Responsive UI state
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('edit');
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);

  // Edição inline
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

  // Form state
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    bannerUrl: '',
    iconUrl: '',
    content: [] as Block[],
    isPublished: false,
  });

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch páginas
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

  // Sync form when page changes
  useEffect(() => {
    if (selectedPage) {
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
    }
  }, [selectedPage]);

  // Unsaved changes detection
  const hasUnsavedChanges = selectedPage
    ? JSON.stringify({
        slug: selectedPage.slug,
        title: selectedPage.title,
        description: selectedPage.description || '',
        bannerUrl: selectedPage.bannerUrl || '',
        iconUrl: selectedPage.iconUrl || '',
        content: selectedPage.content || [],
        isPublished: selectedPage.isPublished,
      }) !==
      JSON.stringify({
        slug: formData.slug,
        title: formData.title,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
        iconUrl: formData.iconUrl,
        content: formData.content,
        isPublished: formData.isPublished,
      })
    : false;

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/public-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao criar página');
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['admin-public-pages'] });
      setSelectedPageId(result.data.id);
      setIsCreating(false);
      toast({ title: 'Página criada com sucesso!' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`/api/admin/public-pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erro ao atualizar página');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-public-pages'] });
      toast({ title: 'Página salva com sucesso!' });
    },
  });

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
      setSelectedPageId(null);
      toast({ title: 'Página deletada com sucesso!' });
    },
  });

  // Handlers
  const handleSave = useCallback(() => {
    if (!selectedPageId) return;
    updateMutation.mutate({ id: selectedPageId, data: formData });
  }, [selectedPageId, formData, updateMutation]);

  const handleCreate = () => {
    if (!formData.slug || !formData.title) {
      toast({
        title: 'Erro',
        description: 'Preencha slug e título',
        variant: 'destructive',
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!selectedPageId) return;
    if (confirm('Tem certeza que deseja deletar esta página?')) {
      deleteMutation.mutate(selectedPageId);
    }
  };

  const handleAddBlock = (type: Block['type']) => {
    let newBlock: Block;
    const id = crypto.randomUUID();

    switch (type) {
      case 'text':
        newBlock = { id, type: 'text', value: 'Novo texto' };
        break;
      case 'image':
        newBlock = { id, type: 'image', src: '', alt: '' };
        break;
      case 'button':
        newBlock = { id, type: 'button', label: 'Clique aqui', url: '#' };
        break;
      case 'list':
        newBlock = { id, type: 'list', items: ['Item 1'], ordered: false };
        break;
      case 'video':
        newBlock = { id, type: 'video', url: '' };
        break;
      case 'section':
        newBlock = { id, type: 'section', title: 'Nova Seção', blocks: [] };
        break;
      default:
        return;
    }

    setFormData({ ...formData, content: [...formData.content, newBlock] });
  };

  const handleBlockSave = (block: Block) => {
    if (editingBlockIndex === null) return;
    const newContent = [...formData.content];
    newContent[editingBlockIndex] = block;
    setFormData({ ...formData, content: newContent });
    setEditingBlockIndex(null);
  };

  const handleDeleteBlock = (index: number) => {
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData({ ...formData, content: newContent });
  };

  const handleDuplicateBlock = (index: number) => {
    const block = formData.content[index];
    const duplicated = JSON.parse(JSON.stringify(block));
    duplicated.id = crypto.randomUUID();
    const newContent = [...formData.content];
    newContent.splice(index + 1, 0, duplicated);
    setFormData({ ...formData, content: newContent });
  };

  const handleMoveBlockUp = (index: number) => {
    if (index === 0) return;
    const newContent = [...formData.content];
    [newContent[index - 1], newContent[index]] = [
      newContent[index],
      newContent[index - 1],
    ];
    setFormData({ ...formData, content: newContent });
  };

  const handleMoveBlockDown = (index: number) => {
    if (index === formData.content.length - 1) return;
    const newContent = [...formData.content];
    [newContent[index], newContent[index + 1]] = [
      newContent[index + 1],
      newContent[index],
    ];
    setFormData({ ...formData, content: newContent });
  };

  const handleHeaderSave = (value: string) => {
    if (!editingHeader) return;
    setFormData({ ...formData, [editingHeader]: value });
    setEditingHeader(null);
  };

  const handleApplyTemplate = (template: PageTemplate) => {
    setFormData({
      ...formData,
      title: template.title,
      description: template.description,
      content: JSON.parse(JSON.stringify(template.blocks)),
    });
    setShowTemplateDialog(false);
    toast({ title: `Template "${template.title}" aplicado!` });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's') {
          e.preventDefault();
          if (selectedPageId) handleSave();
        }
      }
      if (e.key === 'Escape') {
        setEditingBlockIndex(null);
        setEditingHeader(null);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedPageId, formData, handleSave]);

  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'max-w-full';
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Top Toolbar */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="flex items-center justify-between px-3 md:px-6 py-3 gap-3">
          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            <h1 className="text-lg md:text-xl font-bold truncate">
              Editor de Páginas
            </h1>

            {selectedPage && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <span className="truncate max-w-[150px]">
                  {selectedPage.title}
                </span>
                {hasUnsavedChanges && (
                  <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                    Não salvo
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedPage && (
              <>
                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || updateMutation.isPending}
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges}
                  size="icon"
                  className="sm:hidden"
                >
                  <Save className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isPublished: !formData.isPublished,
                    })
                  }
                  className="hidden md:flex"
                >
                  {formData.isPublished ? (
                    <Eye className="h-4 w-4 mr-2" />
                  ) : (
                    <EyeOff className="h-4 w-4 mr-2" />
                  )}
                  {formData.isPublished ? 'Publicado' : 'Rascunho'}
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            >
              {rightSidebarOpen ? (
                <PanelLeftClose className="h-4 w-4" />
              ) : (
                <PanelLeftOpen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Secondary Toolbar - Viewport & Layout Controls */}
        {selectedPage && (
          <div className="border-t px-3 md:px-6 py-2 flex items-center justify-between gap-3 bg-muted/30">
            <div className="flex items-center gap-2">
              {/* Viewport Toggle */}
              <div className="flex items-center gap-1 bg-background rounded-lg p-1">
                <Button
                  variant={viewportMode === 'desktop' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewportMode('desktop')}
                  className="h-7 px-2"
                >
                  <Monitor className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewportMode === 'tablet' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewportMode('tablet')}
                  className="h-7 px-2"
                >
                  <Tablet className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant={viewportMode === 'mobile' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewportMode('mobile')}
                  className="h-7 px-2"
                >
                  <Smartphone className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Layout Mode */}
              <div className="hidden sm:flex items-center gap-1 bg-background rounded-lg p-1">
                <Button
                  variant={layoutMode === 'edit' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setLayoutMode('edit')}
                  className="h-7 px-3 text-xs"
                >
                  Editar
                </Button>
                <Button
                  variant={layoutMode === 'preview' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setLayoutMode('preview')}
                  className="h-7 px-3 text-xs"
                >
                  Preview
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {formData.isPublished && formData.slug && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/${formData.slug}`, '_blank')}
                  className="h-7 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Ver Publicada</span>
                </Button>
              )}
              {selectedPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    window.open(`/preview/${selectedPage.id}`, '_blank')
                  }
                  className="h-7 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Rascunho</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Pages List */}
        <aside
          className={cn(
            'border-r bg-card/30 backdrop-blur transition-all duration-300 flex flex-col',
            'absolute md:relative z-20 h-full md:z-0',
            leftSidebarOpen
              ? 'w-[280px] translate-x-0'
              : 'w-0 md:w-0 -translate-x-full md:translate-x-0'
          )}
        >
          {leftSidebarOpen && (
            <>
              <div className="p-4 border-b space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold">Páginas</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8"
                    onClick={() => setLeftSidebarOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>

                <Button
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedPageId(null);
                    setFormData({
                      slug: '',
                      title: '',
                      description: '',
                      bannerUrl: '',
                      iconUrl: '',
                      content: [],
                      isPublished: false,
                    });
                  }}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Página
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Carregando...
                  </div>
                ) : filteredPages.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Nenhuma página encontrada
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredPages.map((page) => (
                      <button
                        key={page.id}
                        onClick={() => {
                          setSelectedPageId(page.id);
                          setIsCreating(false);
                          if (isMobileView) setLeftSidebarOpen(false);
                        }}
                        className={cn(
                          'w-full text-left p-3 rounded-lg transition-colors',
                          'hover:bg-accent',
                          selectedPageId === page.id && 'bg-accent'
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {page.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              /{page.slug}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {page.isPublished ? (
                              <Eye className="h-3 w-3 text-green-600" />
                            ) : (
                              <EyeOff className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </aside>

        {/* Center - Preview Area */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          {!selectedPageId && !isCreating ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center space-y-4 max-w-md">
                <Layout className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <h2 className="text-2xl font-bold">
                  Bem-vindo ao Editor de Páginas
                </h2>
                <p className="text-muted-foreground">
                  Selecione uma página existente ou crie uma nova para começar a
                  editar
                </p>
                <div className="flex gap-2 justify-center pt-4">
                  <Button
                    onClick={() => {
                      setIsCreating(true);
                      setFormData({
                        slug: '',
                        title: '',
                        description: '',
                        bannerUrl: '',
                        iconUrl: '',
                        content: [],
                        isPublished: false,
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Página
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ver Templates
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-start justify-center p-4 md:p-8">
              <div
                className={cn(
                  'w-full transition-all duration-300 mx-auto',
                  getViewportWidth(),
                  viewportMode !== 'desktop' &&
                    'shadow-2xl rounded-lg overflow-hidden'
                )}
              >
                {/* Page Editor */}
                {isCreating ? (
                  <div className="bg-background rounded-lg border p-6 space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-4">Nova Página</h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Título *
                          </label>
                          <Input
                            value={formData.title}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                title: e.target.value,
                              })
                            }
                            placeholder="Ex: Sobre Nós"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Slug (URL) *
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              /
                            </span>
                            <Input
                              value={formData.slug}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  slug: e.target.value
                                    .toLowerCase()
                                    .replace(/[^a-z0-9-]/g, '-'),
                                })
                              }
                              placeholder="sobre-nos"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Apenas letras minúsculas, números e hífens
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Descrição
                          </label>
                          <Input
                            value={formData.description}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                description: e.target.value,
                              })
                            }
                            placeholder="Breve descrição da página (SEO)"
                          />
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            onClick={handleCreate}
                            disabled={createMutation.isPending}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Página
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setIsCreating(false);
                              setFormData({
                                slug: '',
                                title: '',
                                description: '',
                                bannerUrl: '',
                                iconUrl: '',
                                content: [],
                                isPublished: false,
                              });
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setShowTemplateDialog(true)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Templates
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-background min-h-full">
                    {/* Page Header */}
                    <PageHeaderEditor
                      title={formData.title}
                      description={formData.description}
                      bannerUrl={formData.bannerUrl}
                      iconUrl={formData.iconUrl}
                      onEditTitle={() => setEditingHeader('title')}
                      onEditDescription={() => setEditingHeader('description')}
                      onEditBanner={() => setEditingHeader('bannerUrl')}
                      onEditIcon={() => setEditingHeader('iconUrl')}
                      isHovered={headerHovered && layoutMode === 'edit'}
                      onHoverChange={setHeaderHovered}
                    />

                    {/* Content Blocks */}
                    <div className="p-6 md:p-12 space-y-4">
                      {formData.content.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed rounded-lg">
                          <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Nenhum bloco adicionado ainda
                          </p>
                          {layoutMode === 'edit' && (
                            <Button
                              variant="outline"
                              onClick={() => setRightSidebarOpen(true)}
                            >
                              Adicionar Primeiro Bloco
                            </Button>
                          )}
                        </div>
                      ) : (
                        formData.content.map((block, index) => (
                          <div
                            key={block.id}
                            onMouseEnter={() =>
                              layoutMode === 'edit' &&
                              setHoveredBlockIndex(index)
                            }
                            onMouseLeave={() =>
                              layoutMode === 'edit' &&
                              setHoveredBlockIndex(null)
                            }
                            onDoubleClick={() =>
                              layoutMode === 'edit' &&
                              setEditingBlockIndex(index)
                            }
                            className="relative group"
                          >
                            <BlockRenderer blocks={[block]} />
                            {layoutMode === 'edit' &&
                              hoveredBlockIndex === index && (
                                <BlockStructureOverlay
                                  block={block}
                                  index={index}
                                  totalBlocks={formData.content.length}
                                  onEdit={() => setEditingBlockIndex(index)}
                                  onDelete={() => handleDeleteBlock(index)}
                                  onDuplicate={() =>
                                    handleDuplicateBlock(index)
                                  }
                                  onMoveUp={() => handleMoveBlockUp(index)}
                                  onMoveDown={() => handleMoveBlockDown(index)}
                                  isHovered={true}
                                />
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar - Block Library & Settings */}
        <aside
          className={cn(
            'border-l bg-card/30 backdrop-blur transition-all duration-300',
            'absolute md:relative z-10 h-full right-0',
            rightSidebarOpen
              ? 'w-[280px] translate-x-0'
              : 'w-0 md:w-0 translate-x-full md:translate-x-0'
          )}
        >
          {rightSidebarOpen && selectedPage && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="font-semibold">Componentes</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8"
                  onClick={() => setRightSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Block Library */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                    Blocos Básicos
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'text' as const, icon: Type, label: 'Texto' },
                      {
                        type: 'image' as const,
                        icon: ImageIcon,
                        label: 'Imagem',
                      },
                      {
                        type: 'button' as const,
                        icon: MousePointer,
                        label: 'Botão',
                      },
                      { type: 'list' as const, icon: List, label: 'Lista' },
                      { type: 'video' as const, icon: Video, label: 'Vídeo' },
                      {
                        type: 'section' as const,
                        icon: Layout,
                        label: 'Seção',
                      },
                    ].map(({ type, icon: Icon, label }) => (
                      <button
                        key={type}
                        onClick={() => {
                          handleAddBlock(type);
                          if (isMobileView) setRightSidebarOpen(false);
                        }}
                        className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary hover:bg-accent transition-colors"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Page Settings */}
                <div>
                  <h3 className="text-sm font-medium mb-3 text-muted-foreground">
                    Configurações
                  </h3>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setShowStructureMap(!showStructureMap)}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Estrutura da Página
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Aplicar Template
                    </Button>

                    {selectedPage && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={handleDelete}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar Página
                      </Button>
                    )}
                  </div>
                </div>

                {/* Quick Info */}
                {selectedPage && (
                  <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
                    <p>
                      <strong>Blocos:</strong> {formData.content.length}
                    </p>
                    <p>
                      <strong>Status:</strong>{' '}
                      {formData.isPublished ? 'Publicado' : 'Rascunho'}
                    </p>
                    <p>
                      <strong>Atualizado:</strong>{' '}
                      {new Date(selectedPage.updatedAt).toLocaleDateString(
                        'pt-BR'
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Dialogs */}
      <BlockEditDialog
        key={
          editingBlockIndex !== null
            ? `block-${formData.content[editingBlockIndex]?.id}`
            : 'none'
        }
        open={editingBlockIndex !== null}
        blockIndex={editingBlockIndex}
        block={
          editingBlockIndex !== null
            ? formData.content[editingBlockIndex]
            : null
        }
        onClose={() => setEditingBlockIndex(null)}
        onSave={handleBlockSave}
      />

      <HeaderEditDialog
        key={`header-${editingHeader}-${formData[editingHeader || 'title']}`}
        open={editingHeader !== null}
        field={editingHeader}
        value={editingHeader ? formData[editingHeader] : ''}
        onClose={() => setEditingHeader(null)}
        onSave={handleHeaderSave}
      />

      {/* Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Templates de Página</DialogTitle>
            <DialogDescription>
              Escolha um template para começar rapidamente
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {TEMPLATE_LIST.map((template) => (
              <button
                key={template.slug}
                onClick={() => handleApplyTemplate(template)}
                className="text-left p-4 border rounded-lg hover:border-primary hover:bg-accent transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Layout className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1">{template.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {template.blocks.length} blocos
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Structure Map Dialog */}
      {showStructureMap && selectedPage && (
        <div className="fixed bottom-4 right-4 w-80 max-h-96 bg-card border rounded-lg shadow-2xl overflow-hidden z-30">
          <div className="p-3 border-b flex items-center justify-between bg-muted/50">
            <h3 className="font-semibold text-sm">Estrutura da Página</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowStructureMap(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <div className="overflow-y-auto max-h-80">
            <PageStructureMap
              blocks={formData.content}
              onSelectBlock={(index) => {
                setEditingBlockIndex(index);
                setShowStructureMap(false);
              }}
              selectedBlockIndex={editingBlockIndex}
            />
          </div>
        </div>
      )}

      {/* Mobile FAB - Add Block */}
      {isMobileView && selectedPage && !rightSidebarOpen && (
        <Button
          size="icon"
          className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-2xl z-20"
          onClick={() => setRightSidebarOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
