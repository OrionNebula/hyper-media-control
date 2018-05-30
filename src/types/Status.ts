import { State } from './State'
import { Repeat } from './Repeat'
import { Track } from './Track'

export interface Status {
  isRunning: boolean
  state: State
  progress?: number
  repeat?: Repeat
  shuffle?: boolean
  volume?: number
  track?: Track
}
