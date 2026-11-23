import Boton from '../../../componentes/Boton'
import Campo from '../../../componentes/Campo'
import { IconoBuscar } from '../../../componentes/Iconos'
import Selector from '../../../componentes/Selector'
import type { Artista } from '../../artistas/tipos'
import { ETIQUETAS_CATEGORIA, EventCategorySchema } from '../tipos'

export interface ValoresFiltro {
  q: string
  categoria: string
  artista: string
}

interface PropsBarraFiltros {
  valores: ValoresFiltro
  artistas: Artista[]
  onCambiar: (cambio: Partial<ValoresFiltro>) => void
  onLimpiar: () => void
}

/** Filtros de la cartelera; su estado vive en la URL (?q=&categoria=&artista=). */
export default function BarraFiltros({
  valores,
  artistas,
  onCambiar,
  onLimpiar,
}: PropsBarraFiltros) {
  return (
    <form
      role="search"
      onSubmit={(evento) => evento.preventDefault()}
      className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end"
    >
      <Campo
        etiqueta="Buscar por nombre"
        type="search"
        placeholder="Buscar por nombre..."
        icono={<IconoBuscar className="size-5" />}
        value={valores.q}
        onChange={(evento) => onCambiar({ q: evento.target.value })}
      />
      <Selector
        etiqueta="Categoría"
        value={valores.categoria}
        onChange={(evento) => onCambiar({ categoria: evento.target.value })}
      >
        <option value="">Todas</option>
        {EventCategorySchema.options.map((categoria) => (
          <option key={categoria} value={categoria}>
            {ETIQUETAS_CATEGORIA[categoria]}
          </option>
        ))}
      </Selector>
      <Selector
        etiqueta="Artista"
        value={valores.artista}
        onChange={(evento) => onCambiar({ artista: evento.target.value })}
      >
        <option value="">Todos</option>
        {artistas.map((artista) => (
          <option key={artista.id} value={artista.stageName}>
            {artista.stageName}
          </option>
        ))}
      </Selector>
      <Boton variante="secundario" onClick={onLimpiar}>
        Limpiar
      </Boton>
    </form>
  )
}
