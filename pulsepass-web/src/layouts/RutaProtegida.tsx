import { Navigate, Outlet, useLocation } from 'react-router'
import Cargando from '../componentes/Cargando'
import { useSesion } from '../funcionalidades/auth/hooks'
import type { Rol } from '../funcionalidades/auth/tipos'
import { RUTAS, type EstadoLogin } from '../lib/rutas'
import Pagina from './Pagina'

interface PropsGuarda {
  /** Si se indican, además de sesión se exige alguno de estos roles. */
  roles?: Rol[]
}

/**
 * Guarda de ruta (§12.3): sin sesión → /login (con state.desde y, si venció, motivo);
 * rol insuficiente → /403. Solo experiencia de usuario (FE-004): el servidor aplica la
 * seguridad y un 403 del servidor siempre prevalece.
 */
export function Guarda({ roles }: PropsGuarda) {
  const sesion = useSesion()
  const location = useLocation()
  if (sesion.estado === 'cargando') {
    return (
      <Pagina>
        <Cargando forma="detalle" etiqueta="Verificando sesión…" />
      </Pagina>
    )
  }
  if (sesion.estado === 'anonimo') {
    const estado: EstadoLogin = {
      desde: location.pathname + location.search,
      ...(sesion.motivo ? { motivo: sesion.motivo } : {}),
    }
    return <Navigate to={RUTAS.login} replace state={estado} />
  }
  if (roles && !roles.some((rol) => sesion.usuario.roles.includes(rol))) {
    return <Navigate to={RUTAS.sinPermisos} replace />
  }
  return <Outlet />
}

/** Requiere sesión. */
export default function RutaProtegida() {
  return <Guarda />
}
