import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import TarjetaArtista from '../funcionalidades/artistas/componentes/TarjetaArtista'
import { useArtistasActivos } from '../funcionalidades/artistas/hooks'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'

/** Artistas activos — /artistas (§9.6). */
export default function ListaArtistas() {
  const artistas = useArtistasActivos()
  return (
    <Pagina>
      <title>Artistas · PulsePass</title>
      <h1 className="mb-6 text-3xl font-bold">Artistas</h1>
      {artistas.isPending ? (
        <Cargando forma="tarjetas" cantidad={4} etiqueta="Cargando artistas…" />
      ) : artistas.isError ? (
        <EstadoError
          mensaje={mensajeDeError(artistas.error)}
          onReintentar={() => void artistas.refetch()}
        />
      ) : artistas.data.length === 0 ? (
        <EstadoVacio titulo="Aún no hay artistas activos" />
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {artistas.data.map((artista) => (
            <li key={artista.id}>
              <TarjetaArtista artista={artista} />
            </li>
          ))}
        </ul>
      )}
    </Pagina>
  )
}
