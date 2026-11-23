import type { Key, ReactNode } from 'react'

export interface ColumnaTabla<T> {
  encabezado: string
  celda: (fila: T) => ReactNode
}

interface PropsTabla<T> {
  columnas: ColumnaTabla<T>[]
  filas: T[]
  claveFila: (fila: T) => Key
  titulo?: string
}

/**
 * Tabla genérica. En móvil (< md) cada fila se presenta como tarjeta con pares
 * encabezado/valor; desde md se muestra como tabla (DES/§9.15).
 */
export default function Tabla<T>({ columnas, filas, claveFila, titulo }: PropsTabla<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="block w-full text-left text-sm md:table">
        {titulo ? <caption className="sr-only">{titulo}</caption> : null}
        <thead className="hidden bg-slate-50 md:table-header-group dark:bg-slate-800/60">
          <tr>
            {columnas.map((columna) => (
              <th
                key={columna.encabezado}
                scope="col"
                className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300"
              >
                {columna.encabezado}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="block divide-y divide-slate-200 md:table-row-group dark:divide-slate-800">
          {filas.map((fila) => (
            <tr key={claveFila(fila)} className="block p-4 md:table-row md:p-0">
              {columnas.map((columna) => (
                <td
                  key={columna.encabezado}
                  className="flex items-center justify-between gap-4 py-1 md:table-cell md:px-4 md:py-3"
                >
                  <span className="font-medium text-slate-500 md:hidden dark:text-slate-400">
                    {columna.encabezado}
                  </span>
                  <span>{columna.celda(fila)}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
