'use client';

import { NativeVideoPlayer } from './native-video-player';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type ReactPlayerType from 'react-player';
import { Loader2 } from 'lucide-react';

const DynamicReactPlayer = dynamic(
  () => import('react-player'),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
      </div>
    )
  }
) as any as typeof ReactPlayerType;

interface VideoPlayerProps {
  url: string;
  lessonId: string;
  initialProgress?: number;
  onProgress?: (watchedSeconds: number, totalSeconds: number) => void;
  onComplete?: () => void;
}

const isExternalUrl = (url: string): boolean => {
  if (!url) return false;
  const externalPatterns = [
    /youtube\.com/,
    /youtu\.be/,
    /vimeo\.com/,
  ];
  return externalPatterns.some(pattern => pattern.test(url));
};

export function VideoPlayer(props: VideoPlayerProps) {
  const { url, onProgress, onComplete, initialProgress = 0 } = props;
  const [error, setError] = useState<string | null>(null);

  if (isExternalUrl(url)) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full text-red-500 text-center p-4">
            Não foi possível carregar o vídeo.<br />
            Verifique se o vídeo permite embed ou tente outro link.
          </div>
        ) : (
          <DynamicReactPlayer
            url={url}
            width="100%"
            height="100%"
            controls={true}
            playing={true}
            onProgress={(state) => {
              if (onProgress) {
                onProgress(state.playedSeconds, state.loadedSeconds);
              }
            }}
            onEnded={() => {
              if (onComplete) {
                onComplete();
              }
            }}
            onError={() => setError('Erro ao carregar vídeo')}
          />
        )}
      </div>
    );
  }

  return <NativeVideoPlayer {...props} />;
}
