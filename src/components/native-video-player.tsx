'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

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
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
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
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Event handlers do vídeo
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      console.log('Video duration:', videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (!seeking && videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Atualizar buffer
      if (videoRef.current.buffered.length > 0) {
        const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1);
        setBuffered((bufferedEnd / videoRef.current.duration) * 100);
      }
    }
  };

  const handlePlay = () => {
    setPlaying(true);
    console.log('Video playing');
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
  };

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
  };

  const played = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      id="video-container"
      className="relative aspect-video bg-black rounded-lg overflow-hidden"
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full"
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onError={handleError}
        playsInline
        controls
      />
    </div>
  );
}
