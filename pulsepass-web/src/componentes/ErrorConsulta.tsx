import type { ReactNode } from 'react'
import { Navigate } from 'react-router'
import { mensajeDeError } from '../lib/errores'
import { ApiError } from '../lib/http'
import { RUTAS } from '../lib/rutas'
import EstadoError from './EstadoError'
import MensajePagina from './MensajePagina'

interface PropsErrorConsulta {
  error: unknown
  onReintentar?: () => void
  /** Qué mostrar ante 404 (p. ej. "Evento no disponible"). */
  noEncontrado?: ReactNode
  /** Si el 403 debe tratarse como "no disponible" (recursos ajenos, AC-FE-014). */
  ocultar403?: boolean
}

/**
 * Error en la carga de una página completa (§13): 403 → /403, 404 → no encontrado,
 * red/500 → mensaje + reintentar. El 401 ya lo gestionó lib/http (cierre de sesión).
 */
export default function ErrorConsulta({
  error,
  onReintentar,
  noEncontrado,
  ocultar403 = false,
}: PropsErrorConsulta) {
  if (error instanceof ApiError) {
    if (error.status === 404 || (ocultar403 && error.status === 403)) {
      return noEncontrado ?? <MensajePagina codigo="404" titulo="No encontramos esta página" />
    }
    if (error.status === 403) return <Navigate to={RUTAS.sinPermisos} replace />
  }
  const props = onReintentar ? { onReintentar } : {}
  return <EstadoError mensaje={mensajeDeError(error)} {...props} />
}
