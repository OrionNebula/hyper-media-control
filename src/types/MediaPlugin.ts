import { PlayerManager } from '../PlayerManager'
import { HyperMediaConfig } from './HyperMediaConfig'
import { Status } from './Status'
import { EventEmitter } from 'events'

export interface MediaPluginConstructor {
  name: string

  new (playerManager: PlayerManager, config: HyperMediaConfig): MediaPlugin
}

export interface MediaPlugin extends EventEmitter {
  playerName (): string
  iconUrl (): string
  activate (): void
  deactivate (): void

  playPause? (): Promise<Status> | Promise<void> | void
  nextTrack? (): Promise<Status> | Promise<void> | void
  previousTrack? (): Promise<Status> | Promise<void> | void
  toggleRepeat? (): Promise<Status> | Promise<void> | void
  toggleShuffle? (): Promise<Status> | Promise<void> | void
  changeLibrary? (): void
}
