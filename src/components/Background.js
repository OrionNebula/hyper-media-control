import os from 'os'

export const BackgroundFactory = React => {
  const { Component } = React
  return class extends Component {
    constructor (props) {
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

const backgroundStyle = {
  position: 'absolute',
  top: os.platform === 'darwin' ? 0 : 35,
  right: 10,
  marginBottom: 30,
  opacity: '0.5',
  textAlign: 'right',
  fontSize: 12,
  overflow: 'none'
}
