import { Link } from 'react-router'
import { IconoEdificio } from '../../../componentes/Iconos'
import { RUTAS } from '../../../lib/rutas'
import { useSede } from '../hooks'

interface PropsEnlaceSedeEvento {
  codigo: string
  nombre: string
}

/**
 * Sede dentro del detalle de evento. EventResponse solo trae código y nombre;
 * ciudad y capacidad se consultan a GET /api/venues/{code}.
 */
export default function EnlaceSedeEvento({ codigo, nombre }: PropsEnlaceSedeEvento) {
  const sede = useSede(codigo)
  return (
    <Link
      to={RUTAS.sede(codigo)}
      className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-marca-600 dark:border-slate-700 dark:hover:bg-slate-800"
    >
      <IconoEdificio className="size-6 shrink-0 text-marca-600 dark:text-marca-500" />
      <span>
        <span className="block font-semibold">{nombre}</span>
        {sede.data ? (
          <span className="block text-sm text-slate-600 dark:text-slate-400">
            {sede.data.city} · Capacidad {sede.data.capacity}
          </span>
        ) : null}
      </span>
    </Link>
  )
}
