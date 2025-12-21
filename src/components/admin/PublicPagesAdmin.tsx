'use client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  iconUrl?: string;
  content?: unknown;
}

export default function PublicPagesAdmin() {
  const [pages, setPages] = useState<PublicPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<PublicPage | null>(null);
  const [form, setForm] = useState<Partial<PublicPage>>({});
  const [showDialog, setShowDialog] = useState(false);

  async function fetchPages() {
    setLoading(true);
    const res = await fetch('/api/admin/public-pages');
    const data = await res.json();
    setPages(data.data || []);
    setLoading(false);
  }

  useEffect(() => {
    const loadPages = async () => {
      await fetchPages();
    };
    loadPages();
  }, []);

  function handleEdit(page: PublicPage) {
    setEditing(page);
    setForm(page);
    setShowDialog(true);
  }

  function handleNew() {
    setEditing(null);
    setForm({ slug: '', title: '' });
    setShowDialog(true);
  }

  async function handleSave() {
    setLoading(true);
    const method = editing ? 'PUT' : 'POST';
    const url = editing
      ? `/api/admin/public-pages/${editing.slug}`
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

  async function handleDelete(slug: string) {
    if (!window.confirm('Remover página?')) return;
    setLoading(true);
    const res = await fetch(`/api/admin/public-pages/${slug}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      toast({ title: 'Removido' });
      fetchPages();
    } else {
      toast({ title: 'Erro ao remover', variant: 'destructive' });
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex justify-between mb-4">
        <Button onClick={handleNew}>Nova Página</Button>
      </div>
      <div className="grid gap-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
          >
            <div>
              <div className="font-bold text-lg">{page.title}</div>
              <div className="text-xs text-muted-foreground">/{page.slug}</div>
              <div className="text-sm">{page.description}</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleEdit(page)}
                size="sm"
              >
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(page.slug)}
                size="sm"
              >
                Remover
              </Button>
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
            {/* TODO: Upload de banner/icon, edição de conteúdo avançado */}
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
