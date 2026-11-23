import { Link, useParams } from 'react-router'
import Cargando from '../componentes/Cargando'
import CodigoTexto from '../componentes/CodigoTexto'
import EnlaceVolver from '../componentes/EnlaceVolver'
import ErrorConsulta from '../componentes/ErrorConsulta'
import { IconoFlechaDerecha } from '../componentes/Iconos'
import MensajePagina from '../componentes/MensajePagina'
import Tarjeta from '../componentes/Tarjeta'
import PanelArtistasEvento from '../funcionalidades/admin/componentes/PanelArtistasEvento'
import PanelPublicacion from '../funcionalidades/admin/componentes/PanelPublicacion'
import BadgeEstadoEvento from '../funcionalidades/eventos/componentes/BadgeEstadoEvento'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { CodigoEventoSchema } from '../funcionalidades/eventos/tipos'
import Pagina from '../layouts/Pagina'
import { formatearFechaHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const NO_ENCONTRADO = <MensajePagina codigo="404" titulo="Evento no encontrado" />

/** Gestionar evento — /admin/eventos/:eventCode (§9.18). ADMIN ve también borradores. */
export default function AdminGestionEvento() {
  const parametro = CodigoEventoSchema.safeParse(useParams().eventCode)
  const eventCode = parametro.success ? parametro.data : null
  const evento = useEvento(eventCode)

  return (
    <Pagina estrecha className="space-y-4">
      <title>Gestionar evento · PulsePass</title>
      <EnlaceVolver a={RUTAS.adminEventos}>Eventos</EnlaceVolver>
      {!eventCode ? (
        NO_ENCONTRADO
      ) : evento.isPending ? (
        <Cargando forma="detalle" etiqueta="Cargando evento…" />
      ) : evento.isError ? (
        <ErrorConsulta
          error={evento.error}
          noEncontrado={NO_ENCONTRADO}
          onReintentar={() => void evento.refetch()}
        />
      ) : (
        <Tarjeta className="space-y-8 p-6">
          <header className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold">
                {evento.data.name} · <CodigoTexto>{evento.data.eventCode}</CodigoTexto>
              </h1>
              <BadgeEstadoEvento estado={evento.data.status} />
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              {evento.data.category} · {formatearFechaHora(evento.data.eventDate)} · Mín.{' '}
              {evento.data.minimumAge ?? 0} · {evento.data.venueName}
            </p>
          </header>
          <PanelPublicacion evento={evento.data} />
          <PanelArtistasEvento evento={evento.data} />
          <Link
            to={RUTAS.ticketsPagados(evento.data.eventCode)}
            className="inline-flex min-h-11 items-center gap-2 font-medium text-marca-600 hover:text-marca-700 dark:text-marca-500"
          >
            Tickets pagados <IconoFlechaDerecha className="size-4" />
          </Link>
        </Tarjeta>
      )}
    </Pagina>
  )
}
