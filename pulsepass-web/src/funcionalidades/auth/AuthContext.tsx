import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { configurarHttp } from '../../lib/http'
import { borrarSesionGuardada, guardarSesion, leerSesionGuardada } from './almacenamiento'
import { iniciarSesionApi, obtenerUsuarioAutenticado } from './api'
import { AuthContexto, type ValorAuth } from './contexto'
import type { LoginForm, Rol, Sesion } from './tipos'

interface PropsAuthProvider {
  children: ReactNode
  /** Se invoca cuando la sesión vence (401 o fin de expiresIn); el router redirige a /login. */
  onSesionExpirada?: () => void
}

function estadoInicial(): Sesion {
  return leerSesionGuardada() ? { estado: 'cargando' } : { estado: 'anonimo' }
}

/**
 * Dueño de la sesión (PRD §12): token en memoria + sessionStorage, roles desde /api/auth/me
 * (nunca se decodifica el JWT para decidir permisos) y cierre local ante 401 o vencimiento.
 */
export default function AuthProvider({ children, onSesionExpirada }: PropsAuthProvider) {
  const queryClient = useQueryClient()
  const [sesion, setSesion] = useState<Sesion>(estadoInicial)
  const tokenRef = useRef<string | null>(null)
  const alExpirar = useRef(onSesionExpirada)

  useEffect(() => {
    alExpirar.current = onSesionExpirada
  }, [onSesionExpirada])

  const limpiar = useCallback(
    (siguiente: Sesion) => {
      tokenRef.current = null
      borrarSesionGuardada()
      queryClient.clear()
      setSesion(siguiente)
    },
    [queryClient],
  )

  const cerrarSesion = useCallback(() => limpiar({ estado: 'anonimo' }), [limpiar])

  /**
   * 401 o vencimiento: la sesión pasa a anónima con motivo "expirada". Las guardas de las
   * rutas protegidas y onSesionExpirada redirigen al mismo destino (/login con aviso).
   */
  const expirar = useCallback(() => {
    if (!tokenRef.current) return
    limpiar({ estado: 'anonimo', motivo: 'expirada' })
    alExpirar.current?.()
  }, [limpiar])

  // lib/http lee el token de aquí y nos avisa de los 401.
  useEffect(() => {
    configurarHttp({ obtenerToken: () => tokenRef.current, alNoAutorizado: expirar })
  }, [expirar])

  // Restaurar la sesión al recargar si el token guardado no expiró (FR-FE-AUTH-004).
  useEffect(() => {
    const guardada = leerSesionGuardada()
    if (!guardada) return
    let cancelado = false
    obtenerUsuarioAutenticado(guardada.token)
      .then((usuario) => {
        if (cancelado) return
        tokenRef.current = guardada.token
        setSesion({
          estado: 'autenticado',
          token: guardada.token,
          expiraEn: guardada.expiraEn,
          usuario,
        })
      })
      .catch(() => {
        if (cancelado) return
        borrarSesionGuardada()
        setSesion({ estado: 'anonimo' })
      })
    return () => {
      cancelado = true
    }
  }, [])

  // Cierre local programado al vencer expiresIn.
  const expiraEn = sesion.estado === 'autenticado' ? sesion.expiraEn : null
  useEffect(() => {
    if (expiraEn === null) return
    const temporizador = setTimeout(expirar, Math.max(0, expiraEn - Date.now()))
    return () => clearTimeout(temporizador)
  }, [expiraEn, expirar])

  const iniciarSesion = useCallback(
    async (datos: LoginForm) => {
      const respuesta = await iniciarSesionApi(datos)
      const usuario = await obtenerUsuarioAutenticado(respuesta.accessToken)
      const nueva = {
        token: respuesta.accessToken,
        expiraEn: Date.now() + respuesta.expiresIn * 1000,
      }
      queryClient.clear()
      tokenRef.current = nueva.token
      guardarSesion(nueva)
      setSesion({ estado: 'autenticado', ...nueva, usuario })
      return usuario
    },
    [queryClient],
  )

  const tieneRol = useCallback(
    (...roles: Rol[]) =>
      sesion.estado === 'autenticado' && roles.some((rol) => sesion.usuario.roles.includes(rol)),
    [sesion],
  )

  const valor = useMemo<ValorAuth>(
    () => ({ sesion, iniciarSesion, cerrarSesion, tieneRol }),
    [sesion, iniciarSesion, cerrarSesion, tieneRol],
  )

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>
}
