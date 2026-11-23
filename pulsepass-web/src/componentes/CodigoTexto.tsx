import clsx from 'clsx'

/** Códigos (CMF-2026, TCK-8F2A1C) en fuente monoespaciada (DES-05). */
export default function CodigoTexto({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return <span className={clsx('font-mono tracking-tight', className)}>{children}</span>
}
