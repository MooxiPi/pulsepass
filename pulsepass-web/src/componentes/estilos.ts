/**
 * Tablas de clases Tailwind compartidas por los componentes base.
 * Se escriben completas (FE-008): nunca se construyen dinámicamente.
 */

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma'
export type TamanoBoton = 'normal' | 'grande'

export const VARIANTES_BOTON: Record<VarianteBoton, string> = {
  primario: 'bg-marca-600 text-white hover:bg-marca-700 shadow-sm',
  secundario:
    'border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  peligro: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  fantasma: 'text-marca-600 hover:bg-marca-50 dark:text-marca-500 dark:hover:bg-slate-800',
}

export const TAMANOS_BOTON: Record<TamanoBoton, string> = {
  normal: 'min-h-11 px-4 text-sm',
  grande: 'min-h-13 px-6 text-base',
}

export const CLASES_BASE_BOTON =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 disabled:cursor-not-allowed'

export const CLASES_BOTON_DESHABILITADO =
  'bg-slate-200 text-slate-500 shadow-none dark:bg-slate-800 dark:text-slate-400'

export const CLASES_CONTROL =
  'block w-full min-h-11 rounded-lg border bg-white px-3 text-base text-slate-900 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-marca-600 disabled:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500'

export const CLASES_BORDE = {
  normal: 'border-slate-300 dark:border-slate-700',
  error: 'border-red-500 dark:border-red-500',
} as const

/** Id del texto que describe un control: el error tiene prioridad sobre la ayuda. */
export function describedBy(id: string, error?: string, ayuda?: string): string | undefined {
  if (error) return `${id}-error`
  if (ayuda) return `${id}-ayuda`
  return undefined
}
