import clsx from 'clsx'

type FormaCargando = 'tarjetas' | 'lista' | 'detalle' | 'linea'

interface PropsCargando {
  forma?: FormaCargando
  cantidad?: number
  etiqueta?: string
}

const BLOQUE = 'animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800'

/** Esqueletos con la forma del contenido; aria-busy y texto para lectores (§9.20). */
export default function Cargando({
  forma = 'linea',
  cantidad = 3,
  etiqueta = 'Cargando…',
}: PropsCargando) {
  const items = Array.from({ length: cantidad }, (_, i) => i)
  return (
    <div aria-busy="true" role="status" className="w-full">
      <span className="sr-only">{etiqueta}</span>
      {forma === 'tarjetas' ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i} className="space-y-3">
              <div className={clsx(BLOQUE, 'h-36')} />
              <div className={clsx(BLOQUE, 'h-4 w-1/3')} />
              <div className={clsx(BLOQUE, 'h-5 w-3/4')} />
              <div className={clsx(BLOQUE, 'h-4 w-1/2')} />
            </div>
          ))}
        </div>
      ) : forma === 'lista' ? (
        <div className="space-y-3">
          {items.map((i) => (
            <div key={i} className={clsx(BLOQUE, 'h-20')} />
          ))}
        </div>
      ) : forma === 'detalle' ? (
        <div className="space-y-4">
          <div className={clsx(BLOQUE, 'h-48')} />
          <div className={clsx(BLOQUE, 'h-8 w-2/3')} />
          <div className={clsx(BLOQUE, 'h-4 w-1/2')} />
          <div className={clsx(BLOQUE, 'h-24')} />
        </div>
      ) : (
        <div className={clsx(BLOQUE, 'h-6 w-40')} />
      )}
    </div>
  )
}
