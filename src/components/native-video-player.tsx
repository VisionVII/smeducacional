'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface NativeVideoPlayerProps {
  url: string;
  lessonId: string;
  initialProgress?: number;
  onProgress?: (watchedSeconds: number, totalSeconds: number) => void;
  onComplete?: () => void;
}

export function NativeVideoPlayer({
  url,
  lessonId,
  initialProgress = 0,
  onProgress,
  onComplete,
}: NativeVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [seeking, setSeeking] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [errorState, setErrorState] = useState<{
    code?: number;
    message?: string;
  } | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Restaurar posição inicial
  useEffect(() => {
    if (videoRef.current && initialProgress > 0 && duration > 0) {
      videoRef.current.currentTime = initialProgress;
    }
  }, [initialProgress, duration, lessonId]);

  // Cleanup: pausar vídeo ao desmontar componente
  useEffect(() => {
    const currentVideo = videoRef.current;
    const currentProgressInterval = progressIntervalRef.current;
    const currentControlsTimeout = controlsTimeoutRef.current;

    return () => {
      if (currentVideo) {
        currentVideo.pause();
      }
      if (currentProgressInterval) {
        clearInterval(currentProgressInterval);
      }
      if (currentControlsTimeout) {
        clearTimeout(currentControlsTimeout);
      }
    };
  }, []);

  // Salvar progresso periodicamente
  useEffect(() => {
    if (playing && onProgress && duration > 0) {
      progressIntervalRef.current = setInterval(() => {
        if (videoRef.current) {
          onProgress(videoRef.current.currentTime, duration);
        }
      }, 10000);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [playing, duration, onProgress]);

  // Controles visibilidade
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (playing) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      // limpar estado de erro ao tentar reproduzir
      if (errorState) setErrorState(null);
      if (playing) {
        videoRef.current.pause();
      } else {
        // Verificar se o vídeo ainda está no DOM antes de dar play
        if (document.contains(videoRef.current)) {
          await videoRef.current.play();
        }
      }
    } catch (error) {
      // Ignorar AbortError silenciosamente
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('Play aborted - video element removed');
      } else {
        console.error('Play/Pause error:', error);
        setErrorState({
          message: 'Falha ao reproduzir o vídeo. Tente novamente.',
        });
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setMuted(newVolume === 0);
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !muted;
      setMuted(!muted);
    }
  };

  const handleSeekChange = (value: number) => {
    if (videoRef.current) {
      const time = (value / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleFullscreen = () => {
    const container = document.getElementById('video-container');
    if (container) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        container.requestFullscreen();
      }
    }
  };

  const handlePlaybackRateChange = () => {
    if (videoRef.current) {
      const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
      const currentIndex = rates.indexOf(playbackRate);
      const nextIndex = (currentIndex + 1) % rates.length;
      const newRate = rates[nextIndex];
      videoRef.current.playbackRate = newRate;
      setPlaybackRate(newRate);
    }
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs
        .toString()
        .padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Event handlers do vídeo
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log('Video duration:', videoRef.current.duration);
      // ao carregar metadados, limpamos possíveis erros anteriores
      if (errorState) setErrorState(null);
    }
  };

  const handleTimeUpdate = () => {
    if (!seeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Atualizar buffer
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(
          videoRef.current.buffered.length - 1
        );
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    console.log('Video playing');
    if (errorState) setErrorState(null);
  };

  const handlePause = () => {
    setPlaying(false);
    console.log('Video paused');
  };

  const handleEnded = () => {
    setPlaying(false);

    if (onComplete) {
      onComplete();
    }

    if (onProgress && duration > 0) {
      onProgress(duration, duration);
    }

    console.log('Video ended');
    toast({
      title: 'Lição concluída',
      description: 'Progresso salvo com sucesso.',
    });
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const target = e.target as HTMLVideoElement | null;
    const mediaError = target?.error || null;
    let code: number | undefined;
    let message = 'Ocorreu um erro ao carregar o vídeo.';

    // Mapear códigos de erro de mídia para mensagens amigáveis
    if (mediaError) {
      code = mediaError.code;
      switch (mediaError.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          message = 'Carregamento abortado. Tente novamente.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          message = 'Erro de rede ao carregar o vídeo. Verifique sua conexão.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          message =
            'Não foi possível decodificar o vídeo. Formato possivelmente inválido.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          message = 'Fonte de vídeo não suportada ou não encontrada.';
          break;
        default:
          message = 'Erro desconhecido de mídia.';
      }
    }

    // Log apenas em desenvolvimento para debugging
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `[VideoPlayer] Error: code=${code ?? 'n/a'} message=${message}`
      );
    }

    setErrorState({ code, message });
    setPlaying(false);
    toast({
      title: 'Erro no vídeo',
      description: message || 'Falha ao carregar o vídeo.',
      variant: 'destructive',
    });
  };

  const handleRetry = async () => {
    if (!videoRef.current) return;
    setIsRetrying(true);
    setErrorState(null);
    try {
      // Forçar recarregamento da fonte
      videoRef.current.load();
      await videoRef.current.play();
      toast({
        title: 'Vídeo retomado',
        description: 'Reprodução reiniciada com sucesso.',
      });
    } catch (err) {
      console.error('Retry play error:', err);
      setErrorState({
        message:
          'Ainda não foi possível reproduzir. Tente novamente mais tarde.',
      });
      toast({
        title: 'Falha ao retomar',
        description: 'Tente novamente mais tarde ou verifique sua conexão.',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const played = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="video-container"
      className="relative aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={handleMouseMove}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        playsInline
        crossOrigin="anonymous"
      >
        <source src={url} type="video/mp4" />
        <source src={url} type="video/webm" />
        <source src={url} type="video/ogg" />
        Seu navegador não suporta a reprodução de vídeos.
      </video>

      {/* Custom Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !playing ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={played}
            onChange={(e) => handleSeekChange(Number(e.target.value))}
            onMouseDown={() => setSeeking(true)}
            onMouseUp={() => setSeeking(false)}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${played}%, #4b5563 ${played}%, #4b5563 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-white mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handlePlayPause}
          >
            {playing ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleToggleMute}
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={muted ? 0 : volume}
              onChange={(e) => handleVolumeChange(Number(e.target.value))}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20 text-xs"
            onClick={handlePlaybackRateChange}
          >
            {playbackRate}x
          </Button>

          <div className="ml-auto">
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={handleFullscreen}
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Center Play Button Overlay */}
      {!playing && !errorState && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <Button
            size="lg"
            variant="ghost"
            className="text-white hover:bg-white/20 rounded-full p-6"
            onClick={handlePlayPause}
          >
            <Play className="h-16 w-16" />
          </Button>
        </div>
      )}

      {/* Error Overlay */}
      {errorState && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-6 text-center">
          <p className="text-white text-sm">
            {errorState.message || 'Erro ao reproduzir o vídeo.'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="text-black"
              onClick={handleRetry}
              disabled={isRetrying}
            >
              {isRetrying ? 'Tentando…' : 'Tentar novamente'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setErrorState(null)}
            >
              Fechar
            </Button>
          </div>
          {errorState.code !== undefined && (
            <p className="text-white/60 text-xs">
              Código do erro: {errorState.code}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
