import Cargando from '../componentes/Cargando'
import Pagina from './Pagina'

/** HydrateFallback de la ruta raíz: primera descarga de una página perezosa. */
export default function CargaInicial() {
  return (
    <Pagina>
      <Cargando forma="detalle" etiqueta="Cargando PulsePass…" />
    </Pagina>
  )
}
