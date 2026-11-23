import clsx from 'clsx'
import type { ReactNode } from 'react'
import { IconoAlerta, IconoCerrar, IconoCheck, IconoInfo } from './Iconos'

export type TonoAviso = 'exito' | 'error' | 'info' | 'advertencia'

const TONOS: Record<TonoAviso, string> = {
  exito:
    'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
  error:
    'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  info: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-200',
  advertencia:
    'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200',
}

const ICONOS: Record<TonoAviso, ReactNode> = {
  exito: <IconoCheck className="size-5 shrink-0" />,
  error: <IconoAlerta className="size-5 shrink-0" />,
  info: <IconoInfo className="size-5 shrink-0" />,
  advertencia: <IconoAlerta className="size-5 shrink-0" />,
}

interface PropsAviso {
  tono: TonoAviso
  children: ReactNode
  titulo?: string
  onCerrar?: () => void
  className?: string
}

/**
 * Mensaje en línea. Errores y advertencias usan role="alert" (DES-10);
 * éxito e info usan role="status" (aria-live polite).
 */
export default function Aviso({ tono, children, titulo, onCerrar, className }: PropsAviso) {
  const urgente = tono === 'error' || tono === 'advertencia'
  return (
    <div
      role={urgente ? 'alert' : 'status'}
      className={clsx(
        'flex items-start gap-3 rounded-xl border px-4 py-3 text-sm',
        TONOS[tono],
        className,
      )}
    >
      {ICONOS[tono]}
      <div className="flex-1">
        {titulo ? <p className="font-semibold">{titulo}</p> : null}
        <div>{children}</div>
      </div>
      {onCerrar ? (
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar aviso"
          className="-m-1 rounded p-1 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-current"
        >
          <IconoCerrar className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
