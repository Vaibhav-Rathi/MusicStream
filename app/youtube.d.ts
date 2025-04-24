// src/youtube.d.ts
declare namespace YT {
  interface Player {
    loadVideoById(videoId: string): void;
    playVideo(): void;
  }

  interface PlayerEvent {
    target: Player;
    data: number; // Event data (PlayerState)
  }

  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5
  }
}
