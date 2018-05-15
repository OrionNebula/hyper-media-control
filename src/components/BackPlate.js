const BackPlateFactory = React => () => <span className='hyper-media-plate' style={plateStyle} />

const plateStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  opacity: 0.07,
  backgroundColor: '#FFF'
}

export default BackPlateFactory
