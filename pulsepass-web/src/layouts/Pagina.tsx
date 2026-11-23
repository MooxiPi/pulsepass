import clsx from 'clsx'
import type { ReactNode } from 'react'

interface PropsPagina {
  children: ReactNode
  /** Columna estrecha (max-w-3xl) para formularios y gestión ADMIN (DES-04). */
  estrecha?: boolean
  className?: string
}

/** Contenedor estándar de página: mx-auto max-w-6xl px-4 py-8 (§9.2). */
export default function Pagina({ children, estrecha = false, className }: PropsPagina) {
  return (
    <div
      className={clsx('mx-auto w-full px-4 py-8', estrecha ? 'max-w-3xl' : 'max-w-6xl', className)}
    >
      {children}
    </div>
  )
}
