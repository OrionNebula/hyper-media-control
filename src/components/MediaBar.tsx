import { ButtonFactory } from './Button'
import { TrackInfoFactory } from './TrackInfo'
import * as ExternReact from 'react'
import { PlayerManager } from '../PlayerManager'
import { HyperMediaConfig } from '../types/HyperMediaConfig'
import { MediaPlugin } from '../types/MediaPlugin'
import { Status } from '../types/Status'
import { State } from '../types/State'
import { EventEmitter } from 'events'
import { Promise } from 'es6-promise'

interface MediaBarProps {
  playerManager: PlayerManager
}

interface MediaBarState {
  plugin: MediaPlugin
  status: Status
}

function MediaBarFactory (React: typeof ExternReact) {
  const Button = ButtonFactory(React)
  const TrackInfo = TrackInfoFactory(React)

  return class extends React.Component<MediaBarProps, MediaBarState> {
    newLoad: boolean
    hyperMedia: HyperMediaConfig
    constructor (props: MediaBarProps) {
      super(props)

      this.newLoad = false
      this.hyperMedia = props.playerManager.config

      this.state = {
        plugin: this.props.playerManager.currentPlugin,
        status: { isRunning: false, state: State.Stopped }
      }

      this.props.playerManager.currentPlugin.on('status', (status: Status) => this.setState({ status }))
    }

    componentDidMount () {
      const { playerManager } = this.props
      const { rpc }: { rpc: EventEmitter } = window as any

      rpc.on('hyper-media-control:previousTrack', () => {
        const { plugin } = this.state
        if (plugin) this.handleActionResult(plugin.previousTrack())
      })

      rpc.on('hyper-media-control:playPause', () => {
        const { plugin } = this.state
        if (plugin) this.handleActionResult(plugin.playPause())
      })

      rpc.on('hyper-media-control:nextTrack', () => {
        const { plugin } = this.state
        if (plugin) this.handleActionResult(plugin.nextTrack())
      })

      rpc.on('hyper-media-control:nextPlayer', () => {
        this.cyclePlugin()
      })

      playerManager.on('newPlugin', (newPlugin: MediaPlugin) => {
        this.setState({ plugin: newPlugin, status: { isRunning: false, state: State.Stopped } })
        newPlugin.on('status', (status: Status) => {
          const { plugin } = this.state
          if (this.newLoad && this.hyperMedia.autoResume && status.isRunning && status.track && status.track.name) {
            this.newLoad = false
            if (status.state !== State.Playing) this.handleActionResult(plugin.playPause())
          }
          this.setState({ status })
        })
      })
    }

    render () {
      const { plugin, status } = this.state
      const { playerManager } = this.props

      if (status.isRunning) {
        return <div style={mediaBarStyle}>
          <div style={buttonBlockStyle}>
          { playerManager.plugins.length > 1 ? <Button title={plugin.playerName()} click={() => this.cyclePlugin()} iconUrl={plugin.iconUrl()} style={{ marginRight: 10 }} /> : ''}
          { plugin.changeLibrary && <Button click={() => plugin.changeLibrary()} iconUrl={iconUrls.libraryIconUrl} style={{ marginRight: 10 }} />}
          { this.hyperMedia.shuffleRepeat ? <Button title={'Shuffle'} style={{ marginRight: 6 }} click={plugin.toggleShuffle && (() => this.handleActionResult(plugin.toggleShuffle()))} iconUrl={status.shuffle ? iconUrls.shuffleOnIconUrl : iconUrls.shuffleOffIconUrl} /> : ''}
          <Button title='Previous' click={plugin.previousTrack && (() => this.handleActionResult(plugin.previousTrack()))} iconUrl={iconUrls.previousIconUrl} />
          <Button title='Play/Pause' style={{ marginLeft: 6, marginRight: 6 }} click={plugin.playPause && (() => this.handleActionResult(plugin.playPause()))} iconUrl={status.state === 'playing' ? iconUrls.pauseIconUrl : iconUrls.playIconUrl} />
          <Button title='Next' click={plugin.nextTrack && (() => this.handleActionResult(plugin.nextTrack()))} iconUrl={iconUrls.nextIconUrl} />
          { this.hyperMedia.shuffleRepeat ? <Button title={'Repeat'} style={{ marginLeft: 6 }} click={plugin.toggleRepeat && (() => this.handleActionResult(plugin.toggleRepeat()))} iconUrl={status.repeat === 'none' ? iconUrls.repeatOffIconUrl : (status.repeat === 'one' ? iconUrls.repeatOnceIconUrl : iconUrls.repeatOnIconUrl)} /> : ''}
          </div>
          { status.state !== State.Stopped ? <TrackInfo status={status} /> : ''}
          { this.hyperMedia.showArtwork && status.track && status.track.coverUrl && <img src={status.track.coverUrl} style={artworkStyle} />}
        </div>
      }

      return (
        <div style={mediaBarStyle}>
          <div style={buttonBlockStyle}>
            <Button title={plugin.playerName()} click={() => this.cyclePlugin()} iconUrl={plugin.iconUrl()} style={{ marginRight: 10 }} />
          </div>
        </div>
      )
    }

    handleActionResult (result: any) {
      if (result instanceof Promise) {
        result.then((status?: Status) => {
          if (!status) return
          this.setState({ status })
        }).catch(() => {
          this.setState({ status: { isRunning: false, state: State.Stopped } })
        })
      }
    }

    cyclePlugin () {
      const {
        playerManager
      } = this.props

      const {
        plugin,
        status
      } = this.state

      if (playerManager.plugins.length <= 1) return

      if (this.hyperMedia.autoPause && status.isRunning && status.state === State.Playing) {
        plugin.playPause()
      }

      this.newLoad = true
      playerManager.setActivePlugin(playerManager.plugins[(playerManager.plugins.indexOf(plugin) + 1) % playerManager.plugins.length])
    }
  }
}

const artworkStyle: ExternReact.CSSProperties = {
  width: '10%',
  position: 'fixed',
  right: 15,
  bottom: 25
}

const mediaBarStyle: ExternReact.CSSProperties = {
  height: 30,
  fontSize: 12,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
}

const buttonBlockStyle: ExternReact.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  marginRight: 6
}

const iconUrls = {
  nextIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGbSURBVHic7dm/ThRRFAfgTzE2FiSWFjY2NhRGGgoTK0s6bIAYGix5BXwEeAQIjT4BFMYKtRAJFNpYYGFBYUFhZRwLQzLRFXfZuX9mPV9y2vnduXPu7L2zhBBCCCGEEEIIIYzuOW5myFlAM6CKa3CCh4lzqp6ABj+wgeuJcqqfgPM6wkyCnCQTcHXcCwwwg7dYw5UE16/OoKdyXru41VFObzqg7REOMZ84p6iLOqBdW7gxRk5vXoIX1Qfcv2ROL5fA7+7iDdYxlTk7mVE6oF37uDNCzkR0QNscDrBacAyduGwHtGuY88TEdUDbAt5Lf574Qy0TALfxUtrzRBJdLIFhzhMTvQSKqW0CGmxiFsc5Aq/lCBnSZzzBq5yhtXTAC9yT+eYpPwFneIrH+FpiACWXwGss41PBMRTpgO94hgcK3zz5O+AjlvAuc+5f5eyAbb9+3qq5+a78a1d3qptPYkl2gqmXwB5W8CVxTlGDnso33X8W700HHGNRpq3suLp8CWbfx9ei8Z//ObqD6Qw51U5ACCGEEEIIIYQQ+uUnbxfdZjUcthcAAAAASUVORK5CYII=',
  previousIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGPSURBVHic7dmtblRBFAfwHwSDgYSkAoPB1DQNIEodQfQN1vYV4BHgEeAJ+DSgQBEUCQJDQgIGgULgcCgCAbFtsim9KcveO+dy+/8lk3VzZibn3J0PIiIiIiIiIiKW9+uQNmsQ9wweNIhzpIoF2ManvVjlWi7AKdzCj4VYK3f4v1jHI1zps9OTfXY2oF281fPk+zJkCazhWUeMyZfADu7h/JBBxlgCp3EHLww8ecaXARt4vPfbxFgy4ARumH/omk2ecWTABdzHtYrg1RkwwztFk6duAfb38U9wrmgMqCmBbTzExYLYf2iZAfv7+NdGMnnaZcAg+/g+VH8Ey7VagI+4itv42ShmM8sehhYvM/poK6kogTe4bP5PMAmrHIdn+NrRx2QzYNFTXMKrqgFULwB8xnXcxPfisfyTPm+ENvC+o89JlsBBH7CFu0Zy5f03hroT3MGXjv4nmwGLXmITz6sHcpQWDyO7+NYRq1yrl6F18yuzY1MCB432PJHH0UNai+fxs+ZX6BERERERERERS/kNIUuxxmFdFRsAAAAASUVORK5CYII=',
  playIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAATtSURBVHic7ZtNbFVFFIC/9hlBrbZAnzZGISZAadGdiQ0bUcLGnQtNDKmtMVqILFSqcaeQLogxJJDAxgRRN/5EIerCkEBcGuPOitS/+EQpChr7o7EGel2c91K4nnPfm597W8P9ktnMu/ecM3PnzJw5Mw9KSkpKrmLaCtR1C3An0AusAbqAjvpvs8AfQA2YAMaBXwq0LRfaga3AIeArIHEsp4CDwJa6rP8NVWAPcAb3RlvlR2A30F1gO5xZAexDhnOshqfLLPAK4j5LhjZgCPHZvBqeLueAwVjGh9AFHAYedHjnb+BbpBF/1utuAHqAdcAyB1nvAY8DUw7vRGMj8D3Nv9YccBQYQVaArAmtHdgA7ACO1d9tJv87oC9qy1pgE/BbE8N+Ap4FVgboWQXsAn5uousCMBCgx4lNyNC1jJkCnsFtKDdjGTAKzGTonaWATthI9pc/Dtyao/7bgBMZ+i+Qozt0Yfv8PLJOFxGwVIAxw44EmWA7YyttA943FF4EnoitsAVG6ro1m96JrWzIUDTP4jS+wYhhVwJsi6VkBXaQszuWkgAsd5gkkivsMxQcZ2lsUirASXQbXw4VXkWP7adwn+0fAIZDDTK4HX2JnEFiCW/2KEITZJ135aH6u0eQ0Dc2z6Pb+pKvwHZkG5oWeAa/IKfRAQmSH7jL1zCD5egRYw1PV92qCPP9+nBlByRINDnsKctiFN3m+3yEHVIEzeHvU+kOaJQjxHOJbuAfRccBH2FaGutogHFWByTAl0iYHYMPFfnj1sOWb/Qg29I0H4daZ9APfEYcl9Bs7AdudhGyBf1L9QYYljUCYrpEvyFXnQesEaB9/UYmJ2+GgM/xXyUmEFvTqB/P6oA1St03wCVPo1zZAHyKn0tcQrJEae7QHrY64Cal7lcPY0K4HngNeAN3lziv1N2oPWh1QIdSN+toRCwGcXeJaaXOqQOuGqwO0L62NiqK4E3gbuALh3c0F57RHrQ6QBtCTutoBP4CHgMeZeH8oFWqSp3WJq4xBNSUunXI3ruIleA08DBuX71BBVir1P+gPWyNgNNK3XKkE/LmddyH/OX0ou9WJ7SHrQ4YR6KnNJv9bGqJxpAfxn3IX879Sl3mfsDiFP8NJ48FGFbUZugjRb7XaDqoCJrD/4y+iO1wFX07vN9HmLUh2uVpXBEJkefQbd7sI8xKiU0iE6IrSzIllhUJziOxeJoeYKe3meGzvMXT6Jnqw0hbvOhGT4tPIweVLuSZFl+NbWfI8Twgd3I0vzqBBB2LTQX4BN3GvTEUdCHXWTQFYzEUBLIX3baz6HsCLwYNJQlyQLlYbM+w65HYyt41FF1kcTphO/bx+Ft5KOxEUk1Wj49RzJxQwR72CfA1EYd+mj7kGoql/CRyUJkXq7EnvARJhYVkrltigOzboDPIQaVPsGRxHfBCC3rviagzkwGyR0JjFh4l7H5vFQlvJ5voOk+BjW/Qh5wTZBmWIJuTD4Cn6u9kzRMV5GBjJ7Kr0zY2ms97D/vQq7KdwKtInN8qc8hkeo6F3GMHEmKvBa51kPU28CRGuqtIttF8mMYsZ8lhnQ+lE7mTk3WbM7RMI0tgbstcDFYh11JqxGt4DXiRCBubImlHTmQPsJBjbLXM19/ZD9xLjgc4Rf5pqookQdYjAc1KrvzT1O9IAqbxpyntfK+kpKSkJCb/ApkS3ck6OoRxAAAAAElFTkSuQmCC',
  pauseIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAATGSURBVHic7ZvNbxVVFMB/fc+UJlZbSquIVWJQa6mubdj4QYzGnQtMDMHGNKgh8QvCEm11Y0yt0UQ3JhjjRiVCdGFQorL0D8APEImPCoJ8hD5qpAbec3FeA07PuTPz5s7tGOaXzOa8O/ece+Z+nHvufVBSUlJyFdMRUNeNwN3AELAa6AW6W7/NAeeAGnAQOACcDGhbLlSAh4D3gJ+AZsrnR+BdYH2rrv8NA8CrwAzpG209R4FJoD9gO1KzHJhGurOvhkefOWAKGT6FoQMYQ8ZsXg2PPieATb6Mz0IvsBN4LMU7F4BfEIf91ZJdC6wEbge6UtT1GTAOzKZ4xxsjwBHiv9YFYDfwDLICuCa0SqvMs8AeYD5B/b8Cw15bloB1wJkYw44CLwJ9GfT0AS8RP6GeBkYz6EnFOqTrWsacA14AOj3q7EQcMevQO0cAJ4zg/vJ7gZty1L8K+Nqh/zQ5Dode7DHfAHYQJmCpABMtnZoth4Ee30o7kIlMU3gReMq3wgSMt3RrNn3qW9mYoajB0jR+gXHsnrDRl5Ll2EHODl9KMjCJbtsfeBoK04aCvRRjk1IB9qHb+EbWygfQY/tZ8p3t03IzUGexneeBFa4Xr4mp+DkkTI3yMtLFkqBNSNPA9xHZKLBVKft4Ah3HkJXhzYi8G2nDRII6FlFBormoV2dIF+RoXXODUm6DUTYpy4DflfdrOIaqawyvB25R5FPAPykMC8U80rOi3ArcZ73kcoC2w5sHPkpnV1A+RP845m7V5YAHFNmXwNmURoXkDLI6RXnQesFywErgLkX+VRtGhUZzwFrgBq2w5YARQ76/DYNCs1+RdWC0yXKA9vX/RjI5RecQkoSJMqQVthywWpEdRuLuonMJyRJFuU0rbDngekX2Z7sWLQGnFNl1WkHLAd2KbK5tc8JTV2SpHHDVYDlA+9parygq2hA+rxW0HKB1IXUdLSgDikxrk+mAmiK7A6i2a1FAqsAaRf6bVthywM+KrAs5uSk6Q+inSwe1wpYDDqBvRbX9QdG4X5E1kTYtwnLASfRe8HB7NgXlEUX2A3ps4FwGv1Nkj5LtqCtv+tE/0rfWCy4H7FZkncCTKY0KyRh6tmpPO5W5UmLLUtRT6JSYKynaAD5AEqBXMghsAd5KaNguRTZjyLSySXkeyQ5H2UmGTVw/dlp8VbuV5sAgEulF7azjYc6aUipuIqe0RdhLVIFv0G183YeCXuROjqZgwoeCjLyGbttx9D1BW2wylDSQA8qlYrNhVxN4wreyXYaiiyyNEzZjH49/nIfCHiTVZPWEScLMCVXsbt9EcoLeun6UYeQaiqV8H/pS5ItB7AmviYS7avLTJ6O4b4PWgW2kC5bi6AK2oy91V54E3+tRp5NR3D2hiURlW4k5no6hH3HmsRhdpwjY+AWGkVS5y7Amcp74ORI9DuNOqlRbZbYAX5DsouQhMnT7rFdle4D30WN7i3lkMj3B5dxjN3Ict4Z0Q+cT4GmMdFdINiIXJuK+lq/nODms81npQe7kuCaqrE8dCW9zW+Z8sAIJkWv4a3gNeIViJ2MWUUFyiO9wOceY9Gm03nkbud2RW4AV8k9TA8A9wJ3ItZU+/vunqbNIAmbhT1NqDq+kpKSkxCP/AlJlblernO7XAAAAAElFTkSuQmCC',
  shuffleOnIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAI8SURBVHic7ZpLbtswEEBfAhTdBDlBbuI2ySZw6nzsTW7gnCFbXSjbXCEX6SpFN27RNkGLZCETUAxyZEkckq7mAV5J5Ggeh7QoCQzDMAzDMIxxsjeg7RHwNdaFeDgEpj3bPqJ7bdwCv4FrzSDAHfDa43ejeVG3wL91oGfKlKAmoJm8+5UoQUXAEXXZ+wL+AS40gjaoArGTVsCUsISSKkF1DfhCPeI5KmEO/A3ETiYA2ithrhBzRlh8cgGQVkKX5JMJAHk6PANXEWLM1335YoSmQzIBoFsJ0si/AAv8C2NSAdAuYdGjTyn5zT43JSQXAHEltE0tX19NCVkEQBwJfZJ3OAnZBIBcut+pd3khrgkveNveaFVkFgB+CSvgk9AmRvIOSXIymtPhJ3AqnDuk7ItmCnwDToRz2pLXuKtMyoFw7Ip4Zb9z/PcjLzH65FPvJIvBkmekyZ8z4uQvkRe8S6FtEXd0Q2gbeel/fkK9d9jZu8Chya94/+Bjp7hAfnIslf1n4AfD1omsU2dI8gfAU6DtthIqMm6Hh5S945h69+jro206VGR8IBIjeUcfCVXjnOQCYibv6CKh2jieVIBG8o5tJFSeY8kESM//Yr0nPAN+BWJkfTGiOfKbSJWQRUDK5B1dJKgKaCv7mWLsM+q5H03AfscLmAL3wEfPsZd14IeOfXZhAnxQ7F+k7RMZzZGHQj6RWeL/SCrGa3CJiu2TV18DmhJKTD7Jv8CSejqUmHwnAfaprGEYhmEYhjFS3gDp7WViipKTzAAAAABJRU5ErkJggg==',
  shuffleOffIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAFsSURBVHic7Zm9SsVAEEaPP90VwVZ8Ai1ttLG9irU+iKWVbyPYCjaCpbHQh/ARDPZaBOEWK9zdTNz7rd+BNIGZ7J7MTCALxhhjjDHGmP/IRu0FZHAG7ALvkUnXI5NNzBbwAJxEJlUSADAjWIKaAAiWoCgAAiWoCoAgCZuFccfA3pgHF3CUuDcD7oFToPvLxdwBXyt0fVJYCcotsEhxO7QiAAYJ17lBLQnogMvcoFYEdAyDsK+9kCm5ID0An4Ht0qTqFTD6zSsLCCl7VQFhPa8oIHTgqQl4A85pfNr/xgEjpr0x+kzSAkpDcB94AnYikyoJADgEHgmUoCYAgiUoCoBACaoCIEiCsgCYYCYsy6r9FH2lUIJ6BfxQXAmtCIBBwm1uUEsCeuAmN6gVAT0wB15yA9cKH1jraOwqcb+nwtFYDVJ/hT9InxkujXILFJf9IqoCQjYPmgLCNg96AkI3r8ac4etjjDHGGGOMMaP5BpfDg3zyzsv8AAAAAElFTkSuQmCC',
  repeatOffIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAKNSURBVHic7ZqvbxRBFMc/9FBoHFUIkormBKoCc6opCQTZf+BUU3uSqSBBA4K6tvIqKrC4CjSyvglJSTDlVzCHKJtsLjPb3Zk3817pfJM1O7l93/nsm9k3MwdVVVVVVTdOG9oGtDUHXmub0NQcWHCLITQAbi2ENoDsEB4Ad3IGiNAygAXgcgRaA74A+9iC4AMgnglj4Gvr4ZYghAAMhnA3cH8MfATut+5NgT/A7r9Ay3oBbA8JnqCuOmAG/CZxSEyAH/gJv8WfCSPgKPAbjSsJAMAT4DLw8NBwWAEODHRebE6IhXBooPML4GUqgFgIIwMQenW+76w+AT4A9zxt7/BPjCPgFfCwZ4wh2gBWO9r3yFAXxGRCLnV9BkXSPiQrEEIAsna+kQUIPgBFOt/o2GOguUJ1gqSWAbjM8a41UDoT2vGLvnmfAQ0ITXyVzrcNaEGYo9j5xkDfgiTHnKC+KeoDcMbwBZS6VgSf9RnYBL572naA9xiEEGvIV4qeA5+IK5v/O1koltRVIVAhAMYhlAouPTF2TcJmJZkJvjpkHmNKsg64TqfAFv46YYpSnSAJoE95ego8B3562qbAG27oxOgYloKpw0FsCEjIRRpIgWAGgEs0EHMCBVcHHuoAnJABqXOHogAcsm9AAkIxAA6/0VQDsRAOhOL3kgsYlDKQciAbFX/IN9fRvQ8nVYqOgUeBtq5juGfAiUB8rxz99wBzX8UXUE64A6Yg9CmFf0kEElbxtcMM/beeJRMsToIhPcXARmtXJuT+DpvZWQpBKFGImIZQqhQ1C6HkYsQMBIcOAAgvpS/o/gOVuJpM0NiQWM6EC2BdwQcz9LakGgjfgMdKHgDdM/sJV4uoqqqqqqoh+gtPa5+7K3kKkgAAAABJRU5ErkJggg==',
  repeatOnIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGdSURBVHic7ZmxUcQwEAAXhoQeqICUBLdFYjKOjI/ow41AIfQAGST/Aw9+Icknyyfdzng++LGsW0vnkwSO4ziOOYbaHajNBDzV7kRNJuCTjiUcBHQr4aeALiX8FtCdhDkBXUk4JSBZwkVmB+6A28x7NQjVASPwAUjJDoTewFauqJFwninAAiMREloWAPBeqmELU+AhJpDcJDjHG/Ci2F6IAbgK/P+4v4oxNwKmkg+MeH7Smz/QWg4QEt98SwKEjGHfigAhc863IEBYkPCsCxAWZnvLAgSFT51mHbAmzyjVHFZHgFrBZVWAGmeZ982VomuWwo7jOCrkJsHadJ+E1fYjuq8DNAWYPLPXWgsIcI3BOagxAoTEfbgtsVSAYDh4WCZAMB485AsQGgge8gQIjQQP6QKEhoKHtM+gEA5+YL3TodVrDqH+Yed/VzH5FoIvuhYodsa+BWIE7ID70h2pRWwS3AGXhJNg7fX46xoPGamQhLbGKQndCIB5CV0JgL8SuhMAxxK6FADfEkwK0NgS2+1/bxTaMo3JTVHHcZyu+QKBGRR3y2FEMQAAAABJRU5ErkJggg==',
  repeatOnceIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAHzSURBVHic7Zo9UgIxFIA/HRvvYGdnqQ3MUHgAW72HNtj57KTiAp4AjuAB8CDcQTstgBFhWbIvbzebn29mh2GZTfK+JG8zCVAoFAqF6BiGbkBoZsBb6EaEZAb8kLGEjYBsJWwLyFLCroDsJFQJyErCIQGNJZwpG/AEDJTPWlC3DhgD34C02YC6HujL5TQSTpUCYmCMg4SUBQB8tVVwDFPgxSUQbRKsYgksDMurYwhc1Pz+ur5ao2oEzNqs0KH+Rj2/IbUcIDTs+ZQECIphn4oAQTnnUxAgeCS8kAJGwAd+SVTwzPaWr0FXRqxWaXee5QgGr7ouBVwC78CtQVlTjNYcXU6Ba2yCB8MFVwpJ0AvtFJgC8517yyPPLICHre8DVvsKQdEK0AzBJfvSgpP9FCgCQjcgNCEWQhZU7Qeo9iNiFfAI3O/cm6MQkP0UsBQQ5Zm91RQQ4Iru9gTNsBgBQsN9uD7hOwIEffBz4MSzfm98RoAQcc9v0AoQEggedAKERIKH5gKEhIKHZklQqA9+SHenQ52vOYTwh53HrtbkxxC8WoBLDmjtjL0PuAiYAM9tNyQUrklwApxTnwS7/H9AFZ9dVDImQBLqG4ckZCMAqiVkJQD2JWQnAP5LyFIA/EmIUoDFlthk/XljUFbURLkpWigUClnzC1V6HG3T6dDGAAAAAElFTkSuQmCC',
  libraryIconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAnXwAAJ18BHYa6agAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAJnSURBVHic7Zu/SxxBFMc/l1PBUhIIYhptLcSoRUohTSoLExsrC0uxCzYRIghWluY/EGKsQiBNtLYKeDYBxaQLsVDQQtBELeYIp86Ezd2b9+bY+cAgzO6+/c6XnV/vRshkMpkSUxGMVQUmgHHgsWDcZrgEvgMfgF2NFw7UX3SdWLkC1oDOeE2HHuAwgcb+q7yL1npgOYEGFvkShnziHwgYMCkQIzYVAjolDOgXiKHBgK9SwoAugRgaeHVKGNDWdFgLCLAK7BS8d6OVF6VqwA5uEROd0neBkAEb3J9LW/rUUqX0X0CqY0Ajr2IGbwcDona90neBbIC1AGuyAdYCrCm9AdbT4DGwB5wAvcBTIufv7mJlwD6wAHwEfjfU9wBzwLmWEAsDvuDSU6eeayfAkqYY7TFgn3DjTdA2YIGEGg+6Bhzj+nxSaBqwy+0BLwk0DThr4pnoGWdNA3qbeKZPXMUdNA0YBh7+5zPPYwhpRNOADtwipyhVYD6Slr9oT4OvgdGC9y4CgxG1APoGdAOfcYcoQlSBt8AbDUEWu8FHwBbwHniBO03ShfuRdRY3XS4ie3oliNVmqAJM1Ysppc8HSBhwLRBDA69OCQOOBGJo8MtXKWHAtkAMDbZ8lRIGrAAXAnFi8hX45LsgYUANmCFdEw5wSZg/votSs8A6MFb/+1MoZitcAN9w6bUR4EfoRsl1QA2YFoynQl4HWAuwJhtgLcCa0CB46al7RpoHpVraUIUMOPTUPSHyeR0LQl1gk/bZ5ERjDftz/kVKNDpx/2lxlUAjoxlQJO00BLzEpaxSPBpvnlXKZDKZtuUGwhAPcYCvUfsAAAAASUVORK5CYII='
}

export { MediaBarFactory, MediaBarProps, MediaBarState }
