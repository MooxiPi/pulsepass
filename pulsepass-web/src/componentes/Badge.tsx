import clsx from 'clsx'
import type { ReactNode } from 'react'

export type TonoBadge = 'gris' | 'grisOscuro' | 'verde' | 'ambar' | 'rojo' | 'azul' | 'marca'

/** Paleta de badges del sistema visual (§9.1); los dominios eligen el tono con un mapa tipado. */
const TONOS: Record<TonoBadge, string> = {
  gris: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  grisOscuro: 'bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-slate-100',
  verde: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200',
  ambar: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200',
  rojo: 'bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-200',
  azul: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200',
  marca: 'bg-marca-50 text-marca-700 dark:bg-marca-700/40 dark:text-marca-100',
}

interface PropsBadge {
  tono: TonoBadge
  children: ReactNode
  className?: string
}

export default function Badge({ tono, children, className }: PropsBadge) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide',
        TONOS[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}
