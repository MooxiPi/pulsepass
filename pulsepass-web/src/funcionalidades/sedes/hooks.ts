import { useQuery } from '@tanstack/react-query'
import { obtenerSede, obtenerSedesActivas } from './api'

const CINCO_MINUTOS = 5 * 60_000

export const claveSedes = {
  activas: ['sedes', 'activas'] as const,
  sede: (code: string) => ['sede', code] as const,
}

export function useSedesActivas() {
  return useQuery({
    queryKey: claveSedes.activas,
    queryFn: obtenerSedesActivas,
    staleTime: CINCO_MINUTOS,
  })
}

export function useSede(code: string | null | undefined) {
  return useQuery({
    queryKey: claveSedes.sede(code ?? ''),
    queryFn: () => obtenerSede(code ?? ''),
    enabled: Boolean(code),
    staleTime: CINCO_MINUTOS,
  })
}
