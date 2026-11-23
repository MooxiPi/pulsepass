import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { claveEventos } from '../eventos/hooks'
import {
  cancelarTicket,
  comprarTicket,
  obtenerTicket,
  obtenerTicketsDeUsuario,
  obtenerTicketsPagados,
  usarTicket,
} from './api'
import type { CompraRequest, Ticket } from './tipos'

/** Claves y tiempos de caché (PRD §14.1). */
export const claveTickets = {
  deUsuario: (email: string) => ['tickets', 'usuario', email] as const,
  ticket: (ticketCode: string) => ['ticket', ticketCode] as const,
  pagados: (eventCode: string) => ['tickets', 'pagados', eventCode] as const,
}

const QUINCE_SEGUNDOS = 15_000

export function useTicket(ticketCode: string | null | undefined) {
  return useQuery({
    queryKey: claveTickets.ticket(ticketCode ?? ''),
    queryFn: () => obtenerTicket(ticketCode ?? ''),
    enabled: Boolean(ticketCode),
    staleTime: QUINCE_SEGUNDOS,
  })
}

/** Consulta bajo demanda para la validación de ingreso (se activa al pulsar "Buscar"). */
export const useBuscarTicket = useTicket

export function useMisTickets(email: string | null) {
  return useQuery({
    queryKey: claveTickets.deUsuario(email ?? ''),
    queryFn: () => obtenerTicketsDeUsuario(email ?? ''),
    enabled: Boolean(email),
    staleTime: QUINCE_SEGUNDOS,
  })
}

export function useTicketsPagadosPorEvento(eventCode: string | null | undefined) {
  return useQuery({
    queryKey: claveTickets.pagados(eventCode ?? ''),
    queryFn: () => obtenerTicketsPagados(eventCode ?? ''),
    enabled: Boolean(eventCode),
    staleTime: QUINCE_SEGUNDOS,
  })
}

export function useComprarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (datos: CompraRequest) => comprarTicket(datos),
    onSuccess: async (ticket) => {
      queryClient.setQueryData(claveTickets.ticket(ticket.ticketCode), ticket)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: claveTickets.deUsuario(ticket.userEmail) }),
        queryClient.invalidateQueries({ queryKey: claveEventos.evento(ticket.eventCode) }),
      ])
    },
  })
}

async function refrescarTicket(queryClient: QueryClient, ticket: Ticket) {
  queryClient.setQueryData(claveTickets.ticket(ticket.ticketCode), ticket)
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: claveTickets.ticket(ticket.ticketCode) }),
    queryClient.invalidateQueries({ queryKey: claveTickets.pagados(ticket.eventCode) }),
  ])
}

export function useCancelarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => cancelarTicket(ticketCode),
    onSuccess: async (ticket) => {
      await Promise.all([
        refrescarTicket(queryClient, ticket),
        queryClient.invalidateQueries({ queryKey: claveTickets.deUsuario(ticket.userEmail) }),
      ])
    },
  })
}

export function useUsarTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ticketCode: string) => usarTicket(ticketCode),
    onSuccess: (ticket) => refrescarTicket(queryClient, ticket),
  })
}
