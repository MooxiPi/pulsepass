import MensajePagina from '../componentes/MensajePagina'
import Pagina from '../layouts/Pagina'

/** 403 — /403 (§9.19). */
export default function SinPermisos() {
  return (
    <Pagina>
      <title>Sin permisos · PulsePass</title>
      <MensajePagina codigo="403" titulo="No tienes permisos para acceder a esta sección." />
    </Pagina>
  )
}
