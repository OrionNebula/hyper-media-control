import * as ExternReact from 'react'

function BackPlateFactory (React: typeof ExternReact): ExternReact.SFC {
  return () => <span className='hyper-media-plate' style={plateStyle} />
}

const plateStyle: ExternReact.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  opacity: 0.07,
  backgroundColor: '#FFF'
}

export { BackPlateFactory }
