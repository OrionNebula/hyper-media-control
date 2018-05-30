export interface Track {
  name: string
  artist: string
  coverUrl?: string
  duration?: number
  isPlaying?: boolean // Used to support the background playlist pane, currently unused.
}
