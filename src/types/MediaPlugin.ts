import { PlayerManager } from '../PlayerManager'
import { HyperMediaConfig } from './HyperMediaConfig'
import { Status } from './Status'
import { EventEmitter } from 'events'
import { Track } from './Track'

export interface MediaPluginConstructor extends Function {
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

  on (event: 'status', listener: (status: Status) => void): this
  on (event: 'playlist', listener: (playlist: Track[]) => void): this
  once (event: 'status', listener: (status: Status) => void): this
  once (event: 'playlist', listener: (playlist: Track[]) => void): this
  emit (event: 'status', status: Status): boolean
  emit (event: 'playlist', playlist: Track[]): boolean
}
