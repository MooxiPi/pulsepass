import { z } from 'zod'
import { peticion, segmento } from '../../lib/http'
import { TicketSchema, type CompraRequest } from './tipos'

export const comprarTicket = (datos: CompraRequest) =>
  peticion('/tickets', TicketSchema, { metodo: 'POST', cuerpo: datos })

export const obtenerTicket = (ticketCode: string) =>
  peticion(`/tickets/${segmento(ticketCode)}`, TicketSchema)

export const obtenerTicketsDeUsuario = (email: string) =>
  peticion('/tickets/by-user', z.array(TicketSchema), { query: { email } })

export const obtenerTicketsPagados = (eventCode: string) =>
  peticion(`/events/${segmento(eventCode)}/tickets/paid`, z.array(TicketSchema))

export const cancelarTicket = (ticketCode: string) =>
  peticion(`/tickets/${segmento(ticketCode)}/cancel`, TicketSchema, { metodo: 'PATCH' })

export const usarTicket = (ticketCode: string) =>
  peticion(`/tickets/${segmento(ticketCode)}/use`, TicketSchema, { metodo: 'PATCH' })
