const ButtonFactory = (React) => ({ click, iconUrl, style, title }) => {
  return <div title={title} className={'hyper-media-icon hoverable'} style={Object.assign({}, style, buttonStyle, { webkitMaskImage: `url(${iconUrl})`, display: (click ? 'inherit' : 'none') })} onClick={click} />
}

const buttonStyle = {
  webkitMaskSize: 'contain',
  webkitMaskRepeat: 'no-repeat',
  webkitMaskPosition: 'center',
  opacity: '0.5',
  height: '16px',
  width: '17px',
  backgroundColor: '#FFF'
}

export default ButtonFactory
