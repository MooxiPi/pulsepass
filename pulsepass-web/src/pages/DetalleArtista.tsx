import { useParams } from 'react-router'
import Avatar from '../componentes/Avatar'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import EnlaceVolver from '../componentes/EnlaceVolver'
import ErrorConsulta from '../componentes/ErrorConsulta'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import MensajePagina from '../componentes/MensajePagina'
import { useArtista } from '../funcionalidades/artistas/hooks'
import { IdArtistaSchema } from '../funcionalidades/artistas/tipos'
import GrillaEventos from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosPorArtista } from '../funcionalidades/eventos/hooks'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

/** Detalle de artista — /artistas/:id (§9.6). Un id no numérico es 404 sin llamar a la API. */
export default function DetalleArtista() {
  const parametro = IdArtistaSchema.safeParse(useParams().id)
  const id = parametro.success ? parametro.data : null
  const artista = useArtista(id)
  const eventos = useEventosPorArtista(artista.data?.stageName)

  if (id === null) {
    return (
      <Pagina>
        <MensajePagina codigo="404" titulo="No encontramos esta página" />
      </Pagina>
    )
  }

  return (
    <Pagina>
      <div className="mb-4">
        <EnlaceVolver a={RUTAS.artistas}>Artistas</EnlaceVolver>
      </div>
      {artista.isPending ? (
        <Cargando forma="detalle" etiqueta="Cargando artista…" />
      ) : artista.isError ? (
        <ErrorConsulta error={artista.error} onReintentar={() => void artista.refetch()} />
      ) : (
        <div className="space-y-10">
          <title>{`${artista.data.stageName} · PulsePass`}</title>
          <header className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <Avatar nombre={artista.data.stageName} tamano="grande" />
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">{artista.data.stageName}</h1>
              <p className="text-slate-600 dark:text-slate-400">
                {[artista.data.genre, artista.data.country].filter(Boolean).join(' · ') ||
                  'Nombre artístico'}
              </p>
              <Badge tono={artista.data.active ? 'verde' : 'gris'}>
                {artista.data.active ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </header>
          <section aria-labelledby="titulo-eventos-artista">
            <h2 id="titulo-eventos-artista" className="mb-5 text-xl font-semibold">
              Próximos eventos de {artista.data.stageName}
            </h2>
            {eventos.isPending ? (
              <Cargando forma="tarjetas" etiqueta="Cargando eventos…" />
            ) : eventos.isError ? (
              <EstadoError
                mensaje={mensajeDeError(eventos.error)}
                onReintentar={() => void eventos.refetch()}
              />
            ) : eventos.data.length === 0 ? (
              <EstadoVacio titulo="Sin eventos próximos" />
            ) : (
              <GrillaEventos eventos={eventos.data} />
            )}
          </section>
        </div>
      )}
    </Pagina>
  )
}
