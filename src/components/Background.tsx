import * as os from 'os'

import * as ExternReact from 'react'
import { PlayerManager } from '../PlayerManager'
import { MediaPlugin } from '../types/MediaPlugin'
import { Track } from '../types/Track'

interface BackgroundProps {
  playerManager: PlayerManager
}

interface BackgroundState {
  plugin: MediaPlugin
  playlist: Track[]
}

function BackgroundFactory (React: typeof ExternReact) {
  return class extends React.Component<BackgroundProps, BackgroundState> {
    constructor (props: BackgroundProps) {
      super(props)

      const { playerManager } = this.props

      this.state = {
        plugin: playerManager.currentPlugin,
        playlist: []
      }

      playerManager.currentPlugin.on('playlist', playlist => this.setState({ playlist }))
    }

    componentDidMount () {
      const { playerManager } = this.props

      playerManager.on('newPlugin', newPlugin => {
        this.setState({ plugin: newPlugin, playlist: [] })
        newPlugin.on('playlist', playlist => {
          this.setState({ playlist })
        })
      })
    }

    render () {
      const { playlist } = this.state

      return <div style={backgroundStyle}>{playlist.map(x => <div>{x.isPlaying ? <b>{x.name}</b> : x.name}</div>)}</div>
    }
  }
}

const backgroundStyle: ExternReact.CSSProperties = {
  position: 'absolute',
  top: os.platform() === 'darwin' ? 0 : 35,
  right: 10,
  marginBottom: 30,
  opacity: 0.5,
  textAlign: 'right',
  fontSize: 12,
  overflow: 'none'
}

export { BackgroundFactory, BackgroundProps, BackgroundState }
