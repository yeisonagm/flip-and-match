export interface FullscreenPort {
  isFullscreen(): Promise<boolean>;
  toggle(): Promise<void>;
}
