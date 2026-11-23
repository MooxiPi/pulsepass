import { useQuery } from '@tanstack/react-query'
import { obtenerArtista, obtenerArtistaPorNombre, obtenerArtistasActivos } from './api'

const CINCO_MINUTOS = 5 * 60_000

export const claveArtistas = {
  activos: ['artistas', 'activos'] as const,
  artista: (id: number) => ['artista', id] as const,
  porNombre: (stageName: string) => ['artista', 'nombre', stageName] as const,
}

export function useArtistasActivos() {
  return useQuery({
    queryKey: claveArtistas.activos,
    queryFn: obtenerArtistasActivos,
    staleTime: CINCO_MINUTOS,
  })
}

export function useArtista(id: number | null) {
  return useQuery({
    queryKey: claveArtistas.artista(id ?? 0),
    queryFn: () => obtenerArtista(id ?? 0),
    enabled: id !== null,
    staleTime: CINCO_MINUTOS,
  })
}

export function useArtistaPorNombre(stageName: string | null) {
  return useQuery({
    queryKey: claveArtistas.porNombre(stageName ?? ''),
    queryFn: () => obtenerArtistaPorNombre(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: CINCO_MINUTOS,
  })
}
