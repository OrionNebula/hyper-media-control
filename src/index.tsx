import { registerParentPlugin, getSubPlugins } from 'hyper-plugin-extend'
import { PlayerManager } from './PlayerManager'
import { HyperMediaConfig } from './types/HyperMediaConfig'
import { MediaPluginConstructor } from './types/MediaPlugin'
import { FooterFactory } from './components/Footer'
import * as ExternReact from 'react'

const parentPluginName = 'hyper-media-control'

const onRendererWindow = registerParentPlugin(parentPluginName)

const initialState = {}

function decorateHyper (Hyper, { React }: { React: typeof ExternReact }): any {
  const Footer = FooterFactory(React)

  return class extends React.PureComponent {
    playerManager: PlayerManager
    props: any
    constructor (props: any) {
      super(props)
      this.state = {}

      let a = PlayerManager

      this.playerManager = new PlayerManager(getSubPlugins(parentPluginName) as MediaPluginConstructor[], this.props.hyperMedia as HyperMediaConfig)
    }

    render () {
      const { customInnerChildren: existingInnerChildren } = this.props

      let customInnerChildren = existingInnerChildren ? existingInnerChildren instanceof Array ? existingInnerChildren : [existingInnerChildren] : []

      if (this.playerManager.plugins.length > 0) {
        customInnerChildren = [].concat(customInnerChildren, <Footer playerManager={this.playerManager}/>)
      }

      return <Hyper customInnerChildren={customInnerChildren} {...this.props} />
    }
  }
}

function decorateConfig (config) {
  return { ...config, css: `
      ${config.css || ''}

        .terms_terms {
          margin-bottom: 30px;
        }

        .hyper-media.hoverable:hover,
        .hyper-media .hoverable:hover {
          opacity: 1 !important
        }
    `
  }
}

function reduceUI (state, { type, config }) {
  switch (type) {
    case 'CONFIG_LOAD':
    case 'CONFIG_RELOAD':
      return state.set('hyperMedia', config.hyperMedia)
  }

  return state
}

function mapHyperState ({ ui: { hyperMedia } }, map) {
  return { ...map, hyperMedia: { ...hyperMedia } }
}

function decorateMenu (menu) {
  return menu.map(item => {
    if (item.label !== 'Plugins') return item
    const newItem = { ...item }

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
