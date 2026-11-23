import { useSearchParams } from 'react-router'
import Aviso from '../componentes/Aviso'
import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import { useArtistaPorNombre, useArtistasActivos } from '../funcionalidades/artistas/hooks'
import BarraFiltros, {
  type ValoresFiltro,
} from '../funcionalidades/eventos/componentes/BarraFiltros'
import GrillaEventos from '../funcionalidades/eventos/componentes/GrillaEventos'
import { useEventosPorArtista, useEventosPublicados } from '../funcionalidades/eventos/hooks'
import { EventCategorySchema } from '../funcionalidades/eventos/tipos'
import Pagina from '../layouts/Pagina'
import { esEstado, mensajeDeError } from '../lib/errores'

const normalizar = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

/** Cartelera — /eventos (§9.4). Filtros en la URL; texto y categoría se filtran en cliente. */
export default function CatalogoEventos() {
  const [params, setParams] = useSearchParams()
  // FE-002: los parámetros de URL se validan; una categoría desconocida se ignora.
  const categoria = EventCategorySchema.safeParse(params.get('categoria'))
  const filtros: ValoresFiltro = {
    q: params.get('q') ?? '',
    categoria: categoria.success ? categoria.data : '',
    artista: params.get('artista') ?? '',
  }

  const publicados = useEventosPublicados()
  const porArtista = useEventosPorArtista(filtros.artista || null)
  const artistas = useArtistasActivos()
  const artistaFiltro = useArtistaPorNombre(filtros.artista || null)
  const consulta = filtros.artista ? porArtista : publicados

  function cambiar(cambio: Partial<ValoresFiltro>) {
    const siguiente = { ...filtros, ...cambio }
    const nuevos = new URLSearchParams()
    for (const [clave, valor] of Object.entries(siguiente)) if (valor) nuevos.set(clave, valor)
    setParams(nuevos, { replace: true })
  }

  const texto = normalizar(filtros.q.trim())
  // La visibilidad (solo publicados para el público) la decide el backend.
  const eventos = (consulta.data ?? [])
    .filter((evento) => !texto || normalizar(evento.name).includes(texto))
    .filter((evento) => !filtros.categoria || evento.category === filtros.categoria)

  return (
    <Pagina>
      <title>Cartelera · PulsePass</title>
      <h1 className="mb-6 text-3xl font-bold">Cartelera</h1>
      <BarraFiltros
        valores={filtros}
        artistas={artistas.data ?? []}
        onCambiar={cambiar}
        onLimpiar={() => setParams(new URLSearchParams(), { replace: true })}
      />
      {filtros.artista && esEstado(artistaFiltro.error, 404) ? (
        <Aviso tono="info" className="mt-4">
          No encontramos un artista llamado “{filtros.artista}”.
        </Aviso>
      ) : null}

      <div className="mt-6" aria-live="polite">
        {consulta.isPending ? (
          <Cargando forma="tarjetas" etiqueta="Cargando eventos…" />
        ) : consulta.isError ? (
          <EstadoError
            mensaje={mensajeDeError(consulta.error)}
            onReintentar={() => void consulta.refetch()}
          />
        ) : eventos.length === 0 ? (
          <EstadoVacio
            titulo={
              consulta.data.length === 0
                ? 'Aún no hay eventos publicados'
                : 'Sin resultados para tu búsqueda'
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              {eventos.length} {eventos.length === 1 ? 'evento' : 'eventos'}
            </p>
            <GrillaEventos eventos={eventos} />
          </>
        )}
      </div>
    </Pagina>
  )
}
