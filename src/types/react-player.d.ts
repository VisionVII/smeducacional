declare module 'react-player' {
  import { Component } from 'react';

  export interface ReactPlayerProps {
    url?: string | string[];
    playing?: boolean;
    loop?: boolean;
    controls?: boolean;
    light?: boolean;
    volume?: number;
    muted?: boolean;
    playbackRate?: number;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
    progressInterval?: number;
    playsinline?: boolean;
    pip?: boolean;
    stopOnUnmount?: boolean;
    fallback?: React.ReactElement;
    wrapper?: React.ComponentType<any>;
    config?: {
      youtube?: {
        playerVars?: Record<string, any>;
      };
      facebook?: Record<string, any>;
      soundcloud?: Record<string, any>;
      vimeo?: Record<string, any>;
      file?: Record<string, any>;
      wistia?: Record<string, any>;
      mixcloud?: Record<string, any>;
      dailymotion?: Record<string, any>;
      twitch?: Record<string, any>;
    };
    onReady?: (player: any) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onEnded?: () => void;
    onError?: (error: any) => void;
    onProgress?: (state: {
      played: number;
      playedSeconds: number;
      loaded: number;
      loadedSeconds: number;
    }) => void;
    onSeek?: (seconds: number) => void;
    onEnablePIP?: () => void;
    onDisablePIP?: () => void;
  }

  export default class ReactPlayer extends Component<ReactPlayerProps> {
    seekTo(amount: number, type?: 'seconds' | 'fraction'): void;
    getCurrentTime(): number;
    getSecondsLoaded(): number;
    getDuration(): number;
    getInternalPlayer(): any;
  }
}
