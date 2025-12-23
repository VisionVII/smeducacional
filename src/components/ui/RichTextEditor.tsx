'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const handleChange = (val?: string) => {
    if (onChange && val !== undefined) {
      onChange(val);
    }
  };

  return (
    <div data-color-mode="dark">
      <MDEditor value={value} onChange={handleChange} height={300} />
    </div>
  );
}
