import { createContext, useContext } from 'react'

export type TipoNotificacion = 'exito' | 'error' | 'info'

export interface Notificacion {
  id: number
  tipo: TipoNotificacion
  mensaje: string
}

export type Notificar = (tipo: TipoNotificacion, mensaje: string) => void

export const NotificacionesContexto = createContext<Notificar | null>(null)

/** Muestra avisos (toast) de éxito/error de mutaciones (FR-FE-GEN-003). */
export function useNotificar(): Notificar {
  const notificar = useContext(NotificacionesContexto)
  if (!notificar) throw new Error('useNotificar debe usarse dentro de <ProveedorNotificaciones>')
  return notificar
}
