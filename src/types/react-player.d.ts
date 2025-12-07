declare module 'react-player' {
  import { Component } from 'react';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wrapper?: React.ComponentType<any>;
    config?: {
      youtube?: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        playerVars?: Record<string, any>;
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      facebook?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      soundcloud?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vimeo?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      file?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wistia?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mixcloud?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      dailymotion?: Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      twitch?: Record<string, any>;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onReady?: (player: any) => void;
    onStart?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffer?: () => void;
    onBufferEnd?: () => void;
    onEnded?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
