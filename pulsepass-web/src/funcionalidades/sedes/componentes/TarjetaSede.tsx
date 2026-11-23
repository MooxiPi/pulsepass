import { Link } from 'react-router'
import Badge from '../../../componentes/Badge'
import { IconoEdificio, IconoUbicacion } from '../../../componentes/Iconos'
import { RUTAS } from '../../../lib/rutas'
import type { Sede } from '../tipos'

/** Tarjeta de sede (ciudad, capacidad, estado). */
export default function TarjetaSede({ sede }: { sede: Sede }) {
  return (
    <Link
      to={RUTAS.sede(sede.code)}
      className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-marca-50 text-marca-600 dark:bg-slate-800 dark:text-marca-500">
        <IconoEdificio className="size-6" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <p className="font-titulo font-semibold">{sede.name}</p>
        <p className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
          <IconoUbicacion className="size-4" />
          {sede.city} · Cap. {sede.capacity}
        </p>
        <Badge tono={sede.active ? 'verde' : 'gris'}>{sede.active ? 'Activa' : 'Inactiva'}</Badge>
      </div>
    </Link>
  )
}
