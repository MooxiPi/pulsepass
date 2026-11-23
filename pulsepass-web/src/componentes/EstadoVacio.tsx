import type { ReactNode } from 'react'
import { IconoInfo } from './Iconos'

interface PropsEstadoVacio {
  titulo: string
  descripcion?: string
  accion?: ReactNode
  icono?: ReactNode
}

/** Ícono, mensaje y acción sugerida (§9.20). */
export default function EstadoVacio({ titulo, descripcion, accion, icono }: PropsEstadoVacio) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <span className="flex size-12 items-center justify-center rounded-full bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-500">
        {icono ?? <IconoInfo className="size-6" />}
      </span>
      <p className="font-titulo text-lg font-semibold">{titulo}</p>
      {descripcion ? (
        <p className="max-w-md text-slate-600 dark:text-slate-400">{descripcion}</p>
      ) : null}
      {accion}
    </div>
  )
}
