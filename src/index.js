import { registerParentPlugin, getSubPlugins } from 'hyper-plugin-extend'
import { PlayerManager } from './PlayerManager'
import { FooterFactory } from './components/Footer'
// import { BackgroundFactory } from './components/Background'

const parentPluginName = 'hyper-media-control'

var onRendererWindow = registerParentPlugin(parentPluginName)

function decorateHyper (Hyper, { React }) {
  const Footer = FooterFactory(React)
  // const Background = BackgroundFactory(React)

  return class extends React.PureComponent {
    constructor (props) {
      super(props)

      this.playerManager = new PlayerManager(getSubPlugins(parentPluginName), this.props.hyperMedia || {})
    }

    render () {
      const { customInnerChildren: existingInnerChildren } = this.props

      let customInnerChildren = existingInnerChildren ? existingInnerChildren instanceof Array ? existingInnerChildren : [existingInnerChildren] : []

      if (this.playerManager.plugins.length > 0) {
        customInnerChildren = [].concat(customInnerChildren, React.createElement(Footer, { playerManager: this.playerManager })) // , React.createElement(Background, { playerManager: this.playerManager }))
      }

      return React.createElement(Hyper, Object.assign({}, { customInnerChildren }, this.props))
    }
  }
}

function decorateConfig (config) {
  return Object.assign({}, config, {
    css: `
        ${config.css || ''}

        .terms_terms {
          margin-bottom: 30px;
        }

        .hyper-media.hoverable:hover,
        .hyper-media .hoverable:hover {
          opacity: 1 !important
        }
    `
  })
}

function reduceUI (state, {type, config}) {
  switch (type) {
    case 'CONFIG_LOAD':
    case 'CONFIG_RELOAD':
      return state.set('hyperMedia', config.hyperMedia)
  }

  return state
}

function mapHyperState ({ui: { hyperMedia }}, map) {
  return Object.assign({}, map, {
    hyperMedia: Object.assign({}, hyperMedia)
  })
}

function decorateMenu (menu) {
  return menu.map(item => {
    if (item.label !== 'Plugins') return item
    const newItem = Object.assign({}, item)

    newItem.submenu = newItem.submenu.concat(
      {
        label: 'Hyper Media Control',
        type: 'submenu',
        submenu: [
          {
            label: 'Previous Track',
            click: (clickedItem, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.rpc.emit('hyper-media-control:previousTrack', { focusedWindow })
              }
            }
          },
          {
            label: 'Play/Pause',
            accelerator: `CmdOrCtrl+Alt+Space`,
            click: (clickedItem, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.rpc.emit('hyper-media-control:playPause', { focusedWindow })
              }
            }
          },
          {
            label: 'Next Track',
            click: (clickedItem, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.rpc.emit('hyper-media-control:nextTrack', { focusedWindow })
              }
            }
          },
          {
            label: 'Next Media Player',
            accelerator: `CmdOrCtrl+Shift+Space`,
            click: (clickedItem, focusedWindow) => {
              if (focusedWindow) {
                focusedWindow.rpc.emit('hyper-media-control:nextPlayer', { focusedWindow })
              }
            }
          }
        ]
      })
    return newItem
  }
  )
}

export { onRendererWindow, decorateHyper, decorateConfig, reduceUI, mapHyperState, decorateMenu }
