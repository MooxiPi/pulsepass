import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import Aviso from './Aviso'
import {
  NotificacionesContexto,
  type Notificacion,
  type TipoNotificacion,
} from './notificacionesContexto'

const DURACION_EXITO_MS = 4000

/**
 * Región de avisos (toast). Éxito/info desaparecen a los 4 s; los errores
 * persisten hasta que la persona los cierra (§9.20).
 */
export default function ProveedorNotificaciones({ children }: { children: ReactNode }) {
  const [avisos, setAvisos] = useState<Notificacion[]>([])
  const siguienteId = useRef(1)
  const temporizadores = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const cerrar = useCallback((id: number) => {
    setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id))
    const temporizador = temporizadores.current.get(id)
    if (temporizador) clearTimeout(temporizador)
    temporizadores.current.delete(id)
  }, [])

  const notificar = useCallback(
    (tipo: TipoNotificacion, mensaje: string) => {
      const id = siguienteId.current++
      setAvisos((actuales) => [...actuales, { id, tipo, mensaje }])
      if (tipo !== 'error') {
        temporizadores.current.set(
          id,
          setTimeout(() => cerrar(id), DURACION_EXITO_MS),
        )
      }
    },
    [cerrar],
  )

  useEffect(() => {
    const activos = temporizadores.current
    return () => activos.forEach((temporizador) => clearTimeout(temporizador))
  }, [])

  return (
    <NotificacionesContexto.Provider value={notificar}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 md:right-4 md:bottom-4 md:left-auto md:items-end"
      >
        {avisos.map((aviso) => (
          <Aviso
            key={aviso.id}
            tono={aviso.tipo}
            onCerrar={() => cerrar(aviso.id)}
            className="pointer-events-auto w-full max-w-sm shadow-lg"
          >
            {aviso.mensaje}
          </Aviso>
        ))}
      </div>
    </NotificacionesContexto.Provider>
  )
}
