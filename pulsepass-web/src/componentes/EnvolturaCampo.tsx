import clsx from 'clsx'
import type { ReactNode } from 'react'
import { IconoAlerta } from './Iconos'

interface PropsEnvoltura {
  id: string
  etiqueta: string
  error?: string | undefined
  ayuda?: string | undefined
  ocultarEtiqueta?: boolean
  children: ReactNode
}

/** Etiqueta + control + mensaje de ayuda/error (asociado al control con aria-describedby). */
export default function EnvolturaCampo({
  id,
  etiqueta,
  error,
  ayuda,
  ocultarEtiqueta = false,
  children,
}: PropsEnvoltura) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={clsx(
          'text-sm font-medium text-slate-700 dark:text-slate-300',
          ocultarEtiqueta && 'sr-only',
        )}
      >
        {etiqueta}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
        >
          <IconoAlerta className="size-4 shrink-0" />
          {error}
        </p>
      ) : ayuda ? (
        <p id={`${id}-ayuda`} className="text-sm text-slate-500 dark:text-slate-400">
          {ayuda}
        </p>
      ) : null}
    </div>
  )
}
