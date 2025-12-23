'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface PublicPageLog {
  id: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  changes: Partial<PublicPage>;
  action: string;
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { toast } from '@/components/ui/use-toast';
import dynamic from 'next/dynamic';
import Image from 'next/image';
const Markdown = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});

interface PublicPage {
  id: string;
  slug: string;
  title: string;
  description?: string;
  bannerUrl?: string;
  iconUrl?: string;
  content?: string;
  isPublished?: boolean;
}

export default function PublicPagesEditForm({ page }: { page: PublicPage }) {
  // Histórico de versões
  const [logs, setLogs] = useState<PublicPageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Partial<PublicPage> | null>(
    null
  );
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);
  const [rollbackLoading, setRollbackLoading] = useState(false);

  useEffect(() => {
    async function fetchLogs() {
      setLogsLoading(true);
      const res = await fetch(`/api/admin/public-pages/${page.id}/logs`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.data)) setLogs(data.data);
      setLogsLoading(false);
    }
    fetchLogs();
  }, [page.id]);

  async function handlePreview(version: number) {
    setPreviewVersion(version);
    setShowPreview(true);
    const res = await fetch(
      `/api/admin/public-pages/${page.id}/preview?version=${version}`
    );
    const data = await res.json();
    if (res.ok) setPreviewData(data.data);
    else setPreviewData(null);
  }

  async function handleRollback(version: number) {
    if (!window.confirm('Tem certeza que deseja restaurar esta versão?'))
      return;
    setRollbackLoading(true);
    const res = await fetch(`/api/admin/public-pages/${page.id}/rollback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version }),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: 'Rollback realizado com sucesso' });
      window.location.reload();
    } else {
      toast({
        title: data.error || 'Erro ao restaurar',
        variant: 'destructive',
      });
    }
    setRollbackLoading(false);
  }
  const [form, setForm] = useState<Partial<PublicPage>>(page);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    const res = await fetch(`/api/admin/public-pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: 'Página atualizada com sucesso' });
    } else {
      toast({ title: data.error || 'Erro ao salvar', variant: 'destructive' });
    }
    setLoading(false);
  }

  return (
    <>
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto p-4">
        {/* Formulário de edição */}
        <div className="md:w-1/2 w-full">
          <h2 className="text-2xl font-bold mb-4">
            Editar Página: {page.title}
          </h2>
          <div className="mb-2">
            <label htmlFor="slug" className="block text-sm font-medium mb-1">
              Slug
            </label>
            <Input id="slug" value={form.slug || ''} disabled />
          </div>
          <div className="mb-2">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título
            </label>
            <Input
              id="title"
              value={form.title || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Descrição
            </label>
            <Textarea
              id="description"
              value={form.description || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="mb-2">
            <label
              htmlFor="bannerUrl"
              className="block text-sm font-medium mb-1"
            >
              Banner (URL)
            </label>
            <Input
              id="bannerUrl"
              value={form.bannerUrl || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, bannerUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <div className="mb-2">
            <label htmlFor="iconUrl" className="block text-sm font-medium mb-1">
              Ícone (URL)
            </label>
            <Input
              id="iconUrl"
              value={form.iconUrl || ''}
              onChange={(e) =>
                setForm((f) => ({ ...f, iconUrl: e.target.value }))
              }
              placeholder="https://..."
            />
          </div>
          <RichTextEditor
            value={typeof form.content === 'string' ? form.content : ''}
            onChange={(val) => setForm((f) => ({ ...f, content: val }))}
          />
          <div className="flex items-center gap-2 mt-2 mb-4">
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
          <Button onClick={handleSave} disabled={loading}>
            Salvar Alterações
          </Button>
        </div>
        {/* Histórico de versões */}
        <div className="md:w-1/2 w-full bg-background rounded p-0 border shadow max-w-3xl mx-auto mb-8">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Histórico de Versões</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="text-sm text-muted-foreground">
                  Carregando...
                </div>
              ) : logs.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Nenhuma versão registrada.
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log, idx) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between border-b py-2"
                    >
                      <div>
                        <div className="font-mono text-xs text-muted-foreground">
                          Versão {logs.length - idx}
                        </div>
                        <div className="text-xs">
                          {new Date(log.createdAt).toLocaleString()} por{' '}
                          {log.user?.name || 'Usuário'}
                        </div>
                        <div className="text-xs italic text-muted-foreground">
                          {log.action}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePreview(logs.length - idx)}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRollback(logs.length - idx)}
                          disabled={rollbackLoading}
                        >
                          Rollback
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Preview ao vivo - layout real */}
        <div className="md:w-1/2 w-full bg-background rounded p-0 border shadow max-w-3xl mx-auto">
          {/* Banner */}
          {form.bannerUrl && (
            <div className="w-full h-40 md:h-56 relative rounded-t overflow-hidden">
              <Image
                src={form.bannerUrl}
                alt="Banner"
                fill
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
          )}
          <div className="px-6 py-8">
            <div className="flex items-center gap-3 mb-4">
              {form.iconUrl && (
                <Image
                  src={form.iconUrl}
                  alt="Ícone"
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border bg-white object-cover"
                  priority
                />
              )}
              <div>
                <h1 className="text-3xl font-bold mb-1 leading-tight">
                  {form.title || 'Título da Página'}
                </h1>
                {form.description && (
                  <div className="text-muted-foreground mb-2 text-base">
                    {form.description}
                  </div>
                )}
              </div>
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <Markdown
                source={typeof form.content === 'string' ? form.content : ''}
              />
            </div>
            <div className="mt-6">
              <span className="text-xs text-muted-foreground">
                Rota pública:{' '}
                <span className="font-mono">/public/{form.slug}</span>
              </span>
            </div>
          </div>
        </div>
        {/* Modal de preview de versão */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl">
            <DialogTitle>Preview da Versão {previewVersion}</DialogTitle>
            {previewData ? (
              <div>
                <div className="mb-2">
                  <strong>Título:</strong> {previewData.title}
                </div>
                <div className="mb-2">
                  <strong>Descrição:</strong> {previewData.description}
                </div>
                <div className="mb-2">
                  <strong>Conteúdo:</strong>
                  <div className="prose dark:prose-invert max-w-none border rounded p-2 bg-muted/50">
                    <Markdown
                      source={
                        typeof previewData.content === 'string'
                          ? previewData.content
                          : ''
                      }
                    />
                  </div>
                </div>
                <div className="mb-2">
                  <strong>Publicado:</strong>{' '}
                  {previewData.isPublished ? 'Sim' : 'Não'}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Carregando preview...
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Banner */}
        {form.bannerUrl && (
          <div className="w-full h-40 md:h-56 relative rounded-t overflow-hidden">
            <Image
              src={form.bannerUrl}
              alt="Banner"
              fill
              className="object-cover w-full h-full"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        )}
        <div className="px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            {form.iconUrl && (
              <Image
                src={form.iconUrl}
                alt="Ícone"
                width={48}
                height={48}
                className="w-12 h-12 rounded-full border bg-white object-cover"
                priority
              />
            )}
            <div>
              <h1 className="text-3xl font-bold mb-1 leading-tight">
                {form.title || 'Título da Página'}
              </h1>
              {form.description && (
                <div className="text-muted-foreground mb-2 text-base">
                  {form.description}
                </div>
              )}
            </div>
          </div>
          <div className="prose dark:prose-invert max-w-none">
            <Markdown
              source={typeof form.content === 'string' ? form.content : ''}
            />
          </div>
          <div className="mt-6">
            <span className="text-xs text-muted-foreground">
              Rota pública:{' '}
              <span className="font-mono">/public/{form.slug}</span>
            </span>
          </div>
        </div>
      </div>
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>Preview da Versão {previewVersion}</DialogTitle>
          {previewData ? (
            <div>
              <div className="mb-2">
                <strong>Título:</strong> {previewData?.title ?? ''}
              </div>
              <div className="mb-2">
                <strong>Descrição:</strong> {previewData?.description ?? ''}
              </div>
              <div className="mb-2">
                <strong>Conteúdo:</strong>
                <div className="prose dark:prose-invert max-w-none border rounded p-2 bg-muted/50">
                  <Markdown
                    source={
                      typeof previewData?.content === 'string'
                        ? previewData.content
                        : ''
                    }
                  />
                </div>
              </div>
              <div className="mb-2">
                <strong>Publicado:</strong>{' '}
                {previewData?.isPublished ? 'Sim' : 'Não'}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Carregando preview...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
