import { Status } from '../types/Status'
import * as ExternReact from 'react'

function renderTimeSpan (timeSpan: number) {
  let tSec = timeSpan / 1000 >> 0
  return `${tSec / 60 >> 0}:${('0' + tSec % 60).slice(-2)}`
}

interface TrackInfoProps {
  status: Status
}

function TrackInfoFactory (React: typeof ExternReact): ExternReact.SFC<TrackInfoProps> {
  return ({ status: { track, progress } }) => (
    <div>
      <b>{track.name}</b>
      { track.artist ? <span> by <b>{track.artist}</b></span> : '' }
      <span style={{ marginLeft: 5, display: (track.duration && 'inline') || 'none' }} >
        ({progress ? <span><b>{renderTimeSpan(progress)}</b> / </span> : '' }
        <b>{renderTimeSpan(track.duration)}</b>)
      </span>
    </div>
  )
}

export { TrackInfoFactory, TrackInfoProps }
