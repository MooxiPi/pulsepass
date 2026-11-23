import type { ReactNode } from 'react'
import EnlaceBoton from './EnlaceBoton'

interface PropsMensajePagina {
  codigo?: string
  titulo: string
  descripcion?: string
  acciones?: ReactNode
}

/** Bloque centrado para 403 / 404 / "no disponible" (§9.19). */
export default function MensajePagina({
  codigo,
  titulo,
  descripcion,
  acciones,
}: PropsMensajePagina) {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 py-16 text-center">
      {codigo ? (
        <p className="font-titulo text-6xl font-bold text-marca-600 dark:text-marca-500">
          {codigo}
        </p>
      ) : null}
      <h1 className="text-2xl font-bold">{titulo}</h1>
      {descripcion ? <p className="text-slate-600 dark:text-slate-400">{descripcion}</p> : null}
      <div className="flex flex-wrap justify-center gap-3">
        {acciones ?? <EnlaceBoton to="/">Volver al inicio</EnlaceBoton>}
      </div>
    </div>
  )
}
