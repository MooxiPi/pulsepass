import { Link } from 'react-router'
import { IconoCalendario, IconoUbicacion } from '../../../componentes/Iconos'
import { formatearFecha } from '../../../lib/formato'
import { RUTAS } from '../../../lib/rutas'
import type { EventoResumen } from '../tipos'
import BadgeEstadoEvento from './BadgeEstadoEvento'
import EtiquetaCategoria from './EtiquetaCategoria'
import PanelCategoria from './PanelCategoria'

/** La tarjeta completa es un Link al detalle (§9.4). */
export default function TarjetaEvento({ evento }: { evento: EventoResumen }) {
  return (
    <Link
      to={RUTAS.evento(evento.eventCode)}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca-600 dark:border-slate-800 dark:bg-slate-900"
    >
      <PanelCategoria categoria={evento.category} />
      <div className="space-y-2 p-4">
        <EtiquetaCategoria categoria={evento.category} />
        <h3 className="text-lg font-semibold group-hover:text-marca-600 dark:group-hover:text-marca-500">
          {evento.name}
        </h3>
        <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <IconoCalendario className="size-4" />
          <time dateTime={evento.eventDate}>{formatearFecha(evento.eventDate)}</time>
        </p>
        {evento.venueName ? (
          <p className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <IconoUbicacion className="size-4" />
            {evento.venueName}
          </p>
        ) : null}
        <BadgeEstadoEvento estado={evento.status} />
      </div>
    </Link>
  )
}
