'use client';
import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  iconUrl?: string;
  content?: unknown;
  isPublished?: boolean;
}

export default function PublicPagesAdmin() {
  // Rotas públicas padrão do sistema

  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<PublicPage | null>(null);
  const [form, setForm] = useState<Partial<PublicPage>>({});
  const [showDialog, setShowDialog] = useState(false);

  async function fetchPages() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/public-pages');
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) {
        setPages(data.data);
      } else {
        setPages([]);
      }
    } catch {
      setPages([]);
    }
    setLoading(false);
  }
  useEffect(() => {
    const loadPages = async () => {
      await fetchPages();
    };
    loadPages();
  }, []);

  function handleNew() {
    setEditing(null);
    setForm({ slug: '', title: '' });
    setShowDialog(true);
  }

  async function handleSave() {
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `/api/admin/public-pages/${editing.id}`
      : '/api/admin/public-pages';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: 'Salvo com sucesso' });
      setShowDialog(false);
      fetchPages();
    } else {
      toast({ title: data.error || 'Erro ao salvar', variant: 'destructive' });
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Remover página?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/public-pages/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Removido' });
        await fetchPages();
      } else {
        const data = await res.json();
        toast({
          title: data.error || 'Erro ao remover',
          variant: 'destructive',
        });
      }
    } catch {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
    setLoading(false);
  }

  // Mostra todas as páginas do banco (publicadas e rascunhos), e só mostra rotas padrão como "Cadastrar" se não existirem no banco
  const allPages: PublicPage[] = useMemo(() => {
    const publicRoutes: { slug: string; title: string }[] = [
      { slug: 'about', title: 'Sobre' },
      { slug: 'courses', title: 'Catálogo de Cursos' },
      { slug: 'home', title: 'Página Inicial' },
      // Adicione outras rotas fixas aqui se necessário
    ];
    // Páginas do banco (publicadas e rascunhos)
    const dbPages = pages;
    // Para cada rota padrão, se não existe no banco, adiciona como "Cadastrar"
    const missingDefaults = publicRoutes
      .filter((route) => !dbPages.some((p) => p.slug === route.slug))
      .map((route) => ({
        id: '',
        slug: route.slug,
        title: route.title,
        description: '',
        bannerUrl: '',
        iconUrl: '',
        content: '',
        isPublished: false,
      }));
    // Junta todas: páginas do banco (ordem do banco), depois as rotas padrão faltantes
    return [...dbPages, ...missingDefaults];
  }, [pages]);

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button onClick={handleNew}>Nova Página</Button>
      </div>
      <div className="grid gap-4">
        {allPages.map((page) => (
          <div
            key={page.slug}
            className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            <div>
              <div className="font-bold text-lg flex items-center gap-2">
                {page.title}
                {page.isPublished === true ? (
                  <span className="text-xs px-2 py-0.5 rounded bg-green-600 text-white">
                    Publicado
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-500 text-white">
                    Rascunho
                  </span>
                )}
                {/* Se continuar mostrando apenas rascunhos, verifique a API: ela deve retornar todas as páginas, publicadas e rascunhos, e o campo isPublished deve ser booleano correto. */}
              </div>
              <div className="text-xs text-muted-foreground">
                Rota: <span className="font-mono">/public/{page.slug}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                API:{' '}
                <span className="font-mono">/api/public-pages/{page.slug}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Admin:{' '}
                <span className="font-mono">
                  /admin/public-pages/{page.slug}/edit
                </span>
              </div>
              <div className="text-sm">
                {page.description || (
                  <span className="italic text-muted-foreground">
                    (sem descrição)
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {page.id ? (
                <>
                  <Link href={`/admin/public-pages/${page.slug}/edit`}>
                    <Button variant="outline" size="sm">
                      Editar Avançado
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(page.id)}
                    size="sm"
                  >
                    Remover
                  </Button>
                  <Button
                    variant={page.isPublished ? 'secondary' : 'default'}
                    size="sm"
                    onClick={async () => {
                      setLoading(true);
                      await fetch(`/api/admin/public-pages/${page.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          ...page,
                          isPublished: !page.isPublished,
                        }),
                      });
                      fetchPages();
                      setLoading(false);
                    }}
                  >
                    {page.isPublished ? 'Despublicar' : 'Publicar'}
                  </Button>
                </>
              ) : (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setEditing(null);
                    setForm({ slug: page.slug, title: page.title });
                    setShowDialog(true);
                  }}
                >
                  Cadastrar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogTitle>{editing ? 'Editar Página' : 'Nova Página'}</DialogTitle>
          <div className="flex flex-col gap-2 mt-2">
            <Input
              placeholder="Slug (ex: home, about)"
              value={form.slug || ''}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              disabled={!!editing}
            />
            <Input
              placeholder="Título"
              value={form.title || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
            <Textarea
              placeholder="Descrição"
              value={form.description || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
            <RichTextEditor
              value={typeof form.content === 'string' ? form.content : ''}
              onChange={(val) => setForm((f) => ({ ...f, content: val }))}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={!!form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
              />
              <label htmlFor="isPublished">Publicado</label>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={loading}>
                Salvar
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDialog(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
