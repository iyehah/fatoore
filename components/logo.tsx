import Image from 'next/image'

const Logo = () => {
  return <Image src="/logo.svg" alt="RimInvoice" width={140} height={36} priority className="h-9 w-auto" />
}

export default Logo