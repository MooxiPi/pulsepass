import { Link } from 'react-router'
import { IconoFlechaDerecha } from './Iconos'

/** Título de sección con enlace "Ver todos →". */
export default function EncabezadoSeccion({ titulo, enlace }: { titulo: string; enlace?: string }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-4">
      <h2 className="text-xl font-semibold">{titulo}</h2>
      {enlace ? (
        <Link
          to={enlace}
          className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-marca-600 hover:text-marca-700 dark:text-marca-500"
        >
          Ver todos <IconoFlechaDerecha className="size-4" />
          <span className="sr-only">: {titulo}</span>
        </Link>
      ) : null}
    </div>
  )
}
