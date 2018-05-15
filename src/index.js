import { registerParentPlugin, getSubPlugins } from 'hyper-plugin-extend'
import { PlayerManager } from './PlayerManager'
import { FooterFactory } from './components/Footer'

const parentPluginName = 'hyper-media-control'

var onRendererWindow = registerParentPlugin(parentPluginName)

function decorateHyper (Hyper, { React }) {
  const Footer = FooterFactory(React)

  return class extends React.PureComponent {
    constructor (props) {
      super(props)

      this.playerManager = new PlayerManager(getSubPlugins(parentPluginName), this.props.hyperMedia || {})
    }

    render () {
      const { customInnerChildren: existingInnerChildren } = this.props

      let customInnerChildren = existingInnerChildren ? existingInnerChildren instanceof Array ? existingInnerChildren : [existingInnerChildren] : []

      if (this.playerManager.plugins.length > 0) customInnerChildren = [].concat(customInnerChildren, React.createElement(Footer, { playerManager: this.playerManager, hyperMedia: this.props.hyperMedia }))

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

export { onRendererWindow, decorateHyper, decorateConfig, reduceUI, mapHyperState }
