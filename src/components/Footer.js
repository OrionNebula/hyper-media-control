import BackPlateFactory from './BackPlate'
import MediaBarFactory from './MediaBar'

export const FooterFactory = React => {
  const BackPlate = BackPlateFactory(React)
  const MediaBar = MediaBarFactory(React)

  return ({ playerManager, hyperMedia }) => (
    <footer className='hyper-media hoverable' style={footerStyle}>
      <BackPlate />
      <MediaBar playerManager={playerManager} hyperMedia={hyperMedia} />
    </footer>
  )
}

const footerStyle = {
  position: 'absolute',
  right: 0,
  bottom: 0,
  left: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  opacity: '0.5'
}
