"use client";

import { useState } from 'react';
import { translate } from '@/lib/translate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

export function Translator() {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('en');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const onTranslate = async () => {
    setLoading(true);
    setResult('');
    try {
      const translated = await translate(text, to, from || undefined);
      setResult(translated);
    } catch (error) {
      toast({ title: 'Erro', description: (error as Error).message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="from">De (opcional)</Label>
          <Input id="from" placeholder="pt, es, fr..." value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="to">Para</Label>
          <Input id="to" placeholder="en, pt, es..." value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="text">Texto</Label>
        <Input id="text" placeholder="Digite o texto" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={onTranslate} disabled={loading || !text}>
          {loading ? 'Traduzindo...' : 'Traduzir'}
        </Button>
      </div>
      {result && (
        <div className="p-3 rounded-lg border bg-muted">
          <Label>Resultado</Label>
          <p className="mt-2 whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
