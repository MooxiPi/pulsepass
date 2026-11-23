import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useSesion } from '../funcionalidades/auth/hooks'
import { RUTAS, leerEstadoLogin } from '../lib/rutas'
import Pagina from './Pagina'

/**
 * /login y /registro: con sesión activa redirige a la ruta de origen (state.desde) o a
 * inicio. Así, al completar el login, la guarda y el formulario coinciden en el destino.
 */
export default function SoloAnonimo() {
  const sesion = useSesion()
  const location = useLocation()
  if (sesion.estado === 'cargando') {
    return (
      <Pagina>
        <Cargando forma="linea" />
      </Pagina>
    )
  }
  if (sesion.estado === 'autenticado') {
    return <Navigate to={leerEstadoLogin(location.state).desde ?? RUTAS.inicio} replace />
  }
  return <Outlet />
}
