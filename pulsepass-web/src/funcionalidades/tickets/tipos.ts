import { z } from 'zod'

export const TicketTypeSchema = z.enum(['GENERAL', 'VIP', 'BACKSTAGE', 'STUDENT'])
export type TicketType = z.infer<typeof TicketTypeSchema>

export const TicketStatusSchema = z.enum(['RESERVED', 'PAID', 'CANCELLED', 'USED'])
export type TicketStatus = z.infer<typeof TicketStatusSchema>

/** TicketResponse (Fase 2/3). El precio lo fija el backend (GAP-06). */
export const TicketSchema = z.object({
  id: z.number().int(),
  ticketCode: z.string(),
  type: TicketTypeSchema,
  price: z.number(),
  status: TicketStatusSchema,
  purchaseDate: z.string(),
  userEmail: z.string(),
  eventCode: z.string(),
  eventName: z.string(),
})
export type Ticket = z.infer<typeof TicketSchema>

/** Formulario de compra: solo el tipo; el email sale de la sesión, nunca de un campo. */
export const CompraSchema = z.object({
  type: TicketTypeSchema,
})
export type CompraForm = z.infer<typeof CompraSchema>

/** PurchaseTicketRequest (Fase 3). */
export interface CompraRequest {
  userEmail: string
  eventCode: string
  type: TicketType
}

/** Búsqueda de STAFF por código. */
export const BusquedaTicketSchema = z.object({
  ticketCode: z.string().trim().min(1, 'Ingresa el código del ticket'),
})
export type BusquedaTicketForm = z.infer<typeof BusquedaTicketSchema>

export const CodigoTicketSchema = z.string().trim().min(1).max(80)
