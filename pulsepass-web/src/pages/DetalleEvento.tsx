import { useParams } from 'react-router'
import Cargando from '../componentes/Cargando'
import EnlaceVolver from '../componentes/EnlaceVolver'
import ErrorConsulta from '../componentes/ErrorConsulta'
import { IconoCalendario, IconoPersona } from '../componentes/Iconos'
import MensajePagina from '../componentes/MensajePagina'
import Tarjeta from '../componentes/Tarjeta'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import BadgeEstadoEvento from '../funcionalidades/eventos/componentes/BadgeEstadoEvento'
import EtiquetaCategoria from '../funcionalidades/eventos/componentes/EtiquetaCategoria'
import PanelCategoria from '../funcionalidades/eventos/componentes/PanelCategoria'
import { useEvento } from '../funcionalidades/eventos/hooks'
import { CodigoEventoSchema } from '../funcionalidades/eventos/tipos'
import EnlaceSedeEvento from '../funcionalidades/sedes/componentes/EnlaceSedeEvento'
import PanelCompra from '../funcionalidades/tickets/componentes/PanelCompra'
import Pagina from '../layouts/Pagina'
import { formatearFecha, formatearHora } from '../lib/formato'
import { RUTAS } from '../lib/rutas'

const NO_DISPONIBLE = (
  <MensajePagina
    titulo="Evento no disponible"
    descripcion="El evento no existe o todavía no está publicado."
  />
)

/** Detalle de evento y compra — /eventos/:eventCode (§9.5). */
export default function DetalleEvento() {
  const parametro = CodigoEventoSchema.safeParse(useParams().eventCode)
  const eventCode = parametro.success ? parametro.data : null
  const evento = useEvento(eventCode)

  if (!eventCode) return <Pagina>{NO_DISPONIBLE}</Pagina>

  return (
    <Pagina className="pb-28 md:pb-8">
      <div className="mb-4">
        <EnlaceVolver a={RUTAS.eventos}>Volver a la cartelera</EnlaceVolver>
      </div>
      {evento.isPending ? (
        <Cargando forma="detalle" etiqueta="Cargando evento…" />
      ) : evento.isError ? (
        // GAP-02: un borrador (404) o un 403 se presentan como "Evento no disponible".
        <ErrorConsulta
          error={evento.error}
          noEncontrado={NO_DISPONIBLE}
          ocultar403
          onReintentar={() => void evento.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
          <title>{`${evento.data.name} · PulsePass`}</title>
          <Tarjeta className="overflow-hidden">
            <PanelCategoria categoria={evento.data.category} alto="grande" />
            <div className="space-y-5 p-6">
              <div className="flex items-center gap-3">
                <EtiquetaCategoria categoria={evento.data.category} />
                <BadgeEstadoEvento estado={evento.data.status} />
              </div>
              <h1 className="text-3xl font-bold md:text-4xl">{evento.data.name}</h1>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-600 dark:text-slate-400">
                <p className="flex items-center gap-2">
                  <IconoCalendario className="size-4" />
                  <time dateTime={evento.data.eventDate}>
                    {formatearFecha(evento.data.eventDate)} · {formatearHora(evento.data.eventDate)}
                  </time>
                </p>
                <p className="flex items-center gap-2">
                  <IconoPersona className="size-4" />
                  Edad mínima: {evento.data.minimumAge ?? 0}
                </p>
              </div>
              {evento.data.description ? (
                <p className="leading-relaxed whitespace-pre-line">{evento.data.description}</p>
              ) : null}

              <section aria-labelledby="titulo-artistas" className="space-y-3">
                <h2 id="titulo-artistas" className="text-lg font-semibold">
                  Artistas
                </h2>
                {evento.data.artists.length ? (
                  <ul className="flex flex-wrap gap-4">
                    {evento.data.artists.map((artista) => (
                      <li key={artista.id}>
                        <AvatarArtista artista={artista} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-600 dark:text-slate-400">Artistas por confirmar.</p>
                )}
              </section>

              <section aria-labelledby="titulo-sede" className="space-y-3">
                <h2 id="titulo-sede" className="text-lg font-semibold">
                  Sede
                </h2>
                <EnlaceSedeEvento codigo={evento.data.venueCode} nombre={evento.data.venueName} />
              </section>
            </div>
          </Tarjeta>
          <PanelCompra evento={evento.data} />
        </div>
      )}
    </Pagina>
  )
}
