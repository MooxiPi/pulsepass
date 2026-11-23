import { Link } from 'react-router'
import { IconoFlechaIzquierda } from './Iconos'

/** Enlace "← Volver" de las vistas de detalle. */
export default function EnlaceVolver({ a, children }: { a: string; children: string }) {
  return (
    <Link
      to={a}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-marca-600 hover:text-marca-700 focus-visible:outline-2 focus-visible:outline-marca-600 dark:text-marca-500"
    >
      <IconoFlechaIzquierda className="size-4" />
      {children}
    </Link>
  )
}
