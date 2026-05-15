import Image from 'next/image'

/**
 * Logo Props
 * @param size: 'small' | 'medium' | 'large' or width and height are determined by size
 */

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  width?: number
  height?: number
}

const sizeDimensions = {
  small: { width: 100, height: 24 },
  medium: { width: 140, height: 36 },
  large: { width: 180, height: 48 }
}

const Logo = ({ size = 'medium', width, height }: LogoProps) => {
  const sizeClasses = {
    small: 'h-4 w-auto',
    medium: 'h-9 w-auto',
    large: 'h-12 w-auto'
  }

  const { width: sizeWidth, height: sizeHeight } = sizeDimensions[size]

  return <Image src="/logo.svg" alt="RimInvoice" width={width || sizeWidth} height={height || sizeHeight} priority className={sizeClasses[size]} />
}

export default Logo