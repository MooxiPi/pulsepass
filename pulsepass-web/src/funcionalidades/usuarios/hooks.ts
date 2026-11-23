import { useMutation, useQuery } from '@tanstack/react-query'
import { obtenerUsuarioPorEmail, obtenerUsuarioPorUsername, registrarUsuario } from './api'
import type { RegistroRequest } from './tipos'

export const claveUsuarios = {
  porEmail: (email: string) => ['usuario', email] as const,
  porUsername: (username: string) => ['usuario', 'username', username] as const,
}

export function useRegistrarUsuario() {
  return useMutation({ mutationFn: (datos: RegistroRequest) => registrarUsuario(datos) })
}

export function useUsuarioPorEmail(email: string | null, habilitado = true) {
  return useQuery({
    queryKey: claveUsuarios.porEmail(email ?? ''),
    queryFn: () => obtenerUsuarioPorEmail(email ?? ''),
    enabled: Boolean(email) && habilitado,
    staleTime: 60_000,
  })
}

export function useUsuarioPorUsername(username: string | null, habilitado = true) {
  return useQuery({
    queryKey: claveUsuarios.porUsername(username ?? ''),
    queryFn: () => obtenerUsuarioPorUsername(username ?? ''),
    enabled: Boolean(username) && habilitado,
    staleTime: 60_000,
  })
}
