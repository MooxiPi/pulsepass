import MensajePagina from '../componentes/MensajePagina'
import Pagina from '../layouts/Pagina'

/** 404 — cualquier ruta inexistente (§9.19). */
export default function NoEncontrada() {
  return (
    <Pagina>
      <title>Página no encontrada · PulsePass</title>
      <MensajePagina codigo="404" titulo="No encontramos esta página" />
    </Pagina>
  )
}
