import { Link } from 'react-router'
import Cargando from '../componentes/Cargando'
import EncabezadoSeccion from '../componentes/EncabezadoSeccion'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import AvatarArtista from '../funcionalidades/artistas/componentes/AvatarArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import { useSesion } from '../funcionalidades/auth/hooks'
import GrillaEventos from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

const CLASE_CTA =
  'inline-flex min-h-13 items-center justify-center rounded-lg px-6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

/** Inicio — / (§9.3). Única página, junto al Layout, que no se carga de forma perezosa. */
export default function Inicio() {
  const sesion = useSesion()
  const eventos = useEventosPublicados()
  const artistas = useArtistasActivos()

  return (
    <>
      <title>PulsePass · Descubre los mejores eventos</title>
      <section className="bg-linear-to-r from-marca-600 to-acento-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <h1 className="max-w-xl text-4xl font-bold md:text-5xl">Descubre los mejores eventos</h1>
          <p className="mt-4 text-lg text-white/90">
            Música, cultura, deporte y tecnología en un solo lugar.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={RUTAS.eventos}
              className={`${CLASE_CTA} bg-white text-marca-700 hover:bg-marca-50`}
            >
              Ver cartelera
            </Link>
            {sesion.estado === 'anonimo' ? (
              <Link
                to={RUTAS.registro}
                className={`${CLASE_CTA} border border-white text-white hover:bg-white/10`}
              >
                Crear cuenta
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-10">
        <section aria-label="Próximos eventos">
          <EncabezadoSeccion titulo="Próximos eventos" enlace={RUTAS.eventos} />
          {eventos.isPending ? (
            <Cargando forma="tarjetas" etiqueta="Cargando eventos…" />
          ) : eventos.isError ? (
            <EstadoError
              mensaje={mensajeDeError(eventos.error)}
              onReintentar={() => void eventos.refetch()}
            />
          ) : eventos.data.length === 0 ? (
            <EstadoVacio titulo="Aún no hay eventos publicados" />
          ) : (
            <GrillaEventos eventos={eventos.data.slice(0, 3)} />
          )}
        </section>

        <section aria-label="Artistas destacados">
          <EncabezadoSeccion titulo="Artistas destacados" enlace={RUTAS.artistas} />
          {artistas.isPending ? (
            <Cargando forma="linea" etiqueta="Cargando artistas…" />
          ) : artistas.isError ? (
            <EstadoError
              mensaje={mensajeDeError(artistas.error)}
              onReintentar={() => void artistas.refetch()}
            />
          ) : artistas.data.length === 0 ? (
            <EstadoVacio titulo="Aún no hay artistas activos" />
          ) : (
            <ul className="flex flex-wrap gap-x-8 gap-y-4">
              {artistas.data.slice(0, 6).map((artista) => (
                <li key={artista.id}>
                  <AvatarArtista artista={artista} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  )
}
