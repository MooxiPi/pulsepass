import clsx from 'clsx'

export interface OpcionChip<V extends string> {
  valor: V
  etiqueta: string
}

interface PropsFiltroChips<V extends string> {
  etiqueta: string
  opciones: OpcionChip<V>[]
  seleccionado: V
  onCambiar: (valor: V) => void
}

/** Grupo de chips con aria-pressed (DES-06). */
export default function FiltroChips<V extends string>({
  etiqueta,
  opciones,
  seleccionado,
  onCambiar,
}: PropsFiltroChips<V>) {
  return (
    <div role="group" aria-label={etiqueta} className="flex flex-wrap gap-2">
      {opciones.map((opcion) => {
        const activo = opcion.valor === seleccionado
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambiar(opcion.valor)}
            className={clsx(
              'min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600',
              activo
                ? 'border-marca-600 bg-marca-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
            )}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
