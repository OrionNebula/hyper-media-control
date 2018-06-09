export interface HyperMediaConfig {
  default?: string
  showArtwork: boolean
  autoPause: boolean
  autoResume: boolean
  shuffleRepeat: boolean
}

export const defaultHyperMediaConfig: HyperMediaConfig = {
  showArtwork: true,
  autoPause: false,
  autoResume: false,
  shuffleRepeat: true
}
