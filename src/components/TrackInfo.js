function renderTimeSpan (timeSpan) {
  var tSec = timeSpan / 1000 >> 0
  return `${tSec / 60 >> 0}:${('0' + tSec % 60).slice(-2)}`
}

const TrackInfoFactory = (React) => ({ status: { track, progress } }) => {
  return <div>
    <b>{track.name}</b>
    { track.artist ? <span> by <b>{track.artist}</b></span> : ''}
    <span style={{ marginLeft: 5, display: (track.duration && 'inline') || 'none' }} >
      ({progress ? <span><b>{renderTimeSpan(progress)}</b> / </span> : '' }
      <b>{renderTimeSpan(track.duration)}</b>)
    </span>
  </div>
}

export default TrackInfoFactory
