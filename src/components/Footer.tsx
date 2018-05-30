import { BackPlateFactory } from './BackPlate'
import { MediaBarFactory } from './MediaBar'
import { PlayerManager } from '../PlayerManager'
import * as ExternReact from 'react'

interface FooterProps {
  playerManager: PlayerManager
}

function FooterFactory (React: typeof ExternReact): React.SFC<FooterProps> {
  const BackPlate: any = BackPlateFactory(React)
  const MediaBar: any = MediaBarFactory(React)

  return (props: FooterProps) => (
    <footer className='hyper-media hoverable' style={footerStyle}>
      <BackPlate />
      <MediaBar playerManager={props.playerManager} />
    </footer>
  )
}

export { FooterFactory, FooterProps }

const footerStyle = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: 0.5
} as React.CSSProperties
