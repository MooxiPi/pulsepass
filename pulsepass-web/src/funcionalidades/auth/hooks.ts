import { useMutation } from '@tanstack/react-query'
import { useCallback, useContext } from 'react'
import { useNavigate } from 'react-router'
import { RUTAS } from '../../lib/rutas'
import { AuthContexto, type ValorAuth } from './contexto'
import type { LoginForm, Sesion, UsuarioAutenticado } from './tipos'

export function useAuth(): ValorAuth {
  const valor = useContext(AuthContexto)
  if (!valor) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return valor
}

export const useSesion = (): Sesion => useAuth().sesion

/** Usuario autenticado; solo para componentes bajo RutaProtegida. */
export function useUsuarioActual(): UsuarioAutenticado {
  const sesion = useSesion()
  if (sesion.estado !== 'autenticado') {
    throw new Error('useUsuarioActual requiere una sesión autenticada (usa RutaProtegida).')
  }
  return sesion.usuario
}

/**
 * "Salir": navega a inicio y luego borra token y caché (§12.2). Navegar primero evita que
 * la guarda de una ruta protegida redirija a /login al ver la sesión anónima.
 */
export function useSalir(): () => Promise<void> {
  const { cerrarSesion } = useAuth()
  const navigate = useNavigate()
  return useCallback(async () => {
    await navigate(RUTAS.inicio, { flushSync: true })
    cerrarSesion()
  }, [navigate, cerrarSesion])
}

export function useLogin() {
  const { iniciarSesion } = useAuth()
  return useMutation({ mutationFn: (datos: LoginForm) => iniciarSesion(datos) })
}
