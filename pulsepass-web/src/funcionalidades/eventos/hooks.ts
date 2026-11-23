import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  asociarArtista,
  crearEvento,
  obtenerEvento,
  obtenerEventosPorArtista,
  obtenerEventosPublicados,
  publicarEvento,
} from './api'
import type { CrearEventoRequest } from './tipos'

/** Claves y tiempos de caché (PRD §14.1). */
export const claveEventos = {
  publicados: ['eventos', 'publicados'] as const,
  evento: (eventCode: string) => ['evento', eventCode] as const,
  porArtista: (stageName: string) => ['eventos', 'artista', stageName] as const,
}

export function useEventosPublicados() {
  return useQuery({
    queryKey: claveEventos.publicados,
    queryFn: obtenerEventosPublicados,
    staleTime: 60_000,
  })
}

export function useEvento(eventCode: string | null | undefined) {
  return useQuery({
    queryKey: claveEventos.evento(eventCode ?? ''),
    queryFn: () => obtenerEvento(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: 30_000,
  })
}

export function useEventosPorArtista(stageName: string | null | undefined) {
  return useQuery({
    queryKey: claveEventos.porArtista(stageName ?? ''),
    queryFn: () => obtenerEventosPorArtista(stageName ?? ''),
    enabled: Boolean(stageName),
    staleTime: 60_000,
  })
}

export function useCrearEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CrearEventoRequest) => crearEvento(datos),
    // Siembra la caché del detalle con el evento recién creado (§14.2).
    onSuccess: (evento) => queryClient.setQueryData(claveEventos.evento(evento.eventCode), evento),
  })
}

export function usePublicarEvento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventCode: string) => publicarEvento(eventCode),
    onSuccess: async (evento) => {
      queryClient.setQueryData(claveEventos.evento(evento.eventCode), evento)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: claveEventos.evento(evento.eventCode) }),
        queryClient.invalidateQueries({ queryKey: claveEventos.publicados }),
      ])
    },
  })
}

interface DatosAsociacion {
  eventCode: string
  artistId: number
  stageName: string
}

export function useAsociarArtista() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ eventCode, artistId }: DatosAsociacion) => asociarArtista(eventCode, artistId),
    onSuccess: async (evento, { stageName }) => {
      queryClient.setQueryData(claveEventos.evento(evento.eventCode), evento)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: claveEventos.evento(evento.eventCode) }),
        queryClient.invalidateQueries({ queryKey: claveEventos.porArtista(stageName) }),
      ])
    },
  })
}
