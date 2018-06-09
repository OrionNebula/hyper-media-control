import { EventEmitter } from 'events'
import { HyperMediaConfig, defaultHyperMediaConfig } from './types/HyperMediaConfig'
import { MediaPlugin, MediaPluginConstructor } from './types/MediaPlugin'

export interface PlayerManager {
  on (event: 'newPlugin', listener: (plugin: MediaPlugin) => void): this
  once (event: 'newPlugin', listener: (plugin: MediaPlugin) => void): this
  emit (event: 'newPlugin', plugin: MediaPlugin): boolean
}

export class PlayerManager extends EventEmitter {
  config: HyperMediaConfig
  plugins: MediaPlugin[]
  currentPlugin: MediaPlugin

  constructor (pluginClasses: MediaPluginConstructor[], config: HyperMediaConfig) {
    super()
    this.config = { ...defaultHyperMediaConfig, ...config }
    this.plugins = []
    pluginClasses.forEach(PluginClass => {
      let obj = new PluginClass(this, config)
      if (this.validatePlugin(obj)) {
        this.plugins.push(obj)
      } else {
        console.error(`Media plugin ${PluginClass.name} failed validation. It may be missing some required methods.`)
      }
    })

    console.log(`Loaded ${this.plugins.length} media plugins.`)

    let maybeDefault = this.plugins.filter(x => x.playerName() === this.config.default).pop()
    if (!config.default || !maybeDefault) this.setActivePlugin(this.plugins[0])
    else this.setActivePlugin(maybeDefault)
  }

  setActivePlugin (newPlugin: MediaPlugin) {
    if (this.currentPlugin) {
      this.currentPlugin.deactivate()
      this.currentPlugin.removeAllListeners()
    }

    this.currentPlugin = newPlugin
    if (newPlugin) {
      newPlugin.activate()
    }

    this.emit('newPlugin', newPlugin)
  }

  validatePlugin (mediaPlugin: MediaPlugin): boolean {
    const requiredFunctions = [
      'playerName',
      'iconUrl',
      'activate',
      'deactivate'
    ]

    for (let i = 0; i < requiredFunctions.length; i++) {
      if (!(requiredFunctions[i] in mediaPlugin)) return false
    }

    return true
  }
}
