import * as ExternReact from 'react'

interface ButtonProps {
  click: (event: ExternReact.MouseEvent<HTMLDivElement>) => void
  iconUrl: string
  style?: ExternReact.CSSProperties
  title?: string
}

function ButtonFactory (React: typeof ExternReact): React.SFC<ButtonProps> {
  return (props: ButtonProps) => (
    <div title={props.title} className='hyper-media-icon hoverable' style={{ ...props.style, ...buttonStyle, WebkitMaskImage: `url(${props.iconUrl})`, display: (props.click ? 'inherit' : 'none') }} onClick={props.click} />
  )
}

const buttonStyle: ExternReact.CSSProperties = {
  WebkitMaskSize: 'contain',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskPosition: 'center',
  opacity: 0.5,
  height: 16,
  width: 17,
  backgroundColor: '#FFF'
}

export { ButtonFactory, ButtonProps }
