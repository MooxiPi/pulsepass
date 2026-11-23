import { z } from 'zod'

/** Rutas centralizadas (PRD FE-003): no se escriben strings de ruta sueltos. */
const c = encodeURIComponent

export const RUTAS = {
  inicio: '/',
  eventos: '/eventos',
  evento: (eventCode: string) => `/eventos/${c(eventCode)}`,
  artistas: '/artistas',
  artista: (id: number) => `/artistas/${id}`,
  sedes: '/sedes',
  sede: (code: string) => `/sedes/${c(code)}`,
  login: '/login',
  registro: '/registro',
  cuenta: '/cuenta',
  misTickets: '/mis-tickets',
  ticket: (ticketCode: string) => `/mis-tickets/${c(ticketCode)}`,
  confirmacionCompra: (ticketCode: string) => `/compra/confirmacion/${c(ticketCode)}`,
  validacionIngreso: '/staff/validacion',
  ticketsPagados: (eventCode: string) => `/staff/eventos/${c(eventCode)}/tickets`,
  adminEventos: '/admin/eventos',
  adminCrearEvento: '/admin/eventos/nuevo',
  adminEvento: (eventCode: string) => `/admin/eventos/${c(eventCode)}`,
  sinPermisos: '/403',
} as const

/** Estado que viaja con la navegación hacia /login. */
export interface EstadoLogin {
  desde?: string
  motivo?: 'expirada'
  registrado?: boolean
}

/**
 * El state de navegación es dato externo (FE-002): se valida y `desde` solo acepta rutas
 * internas ("/..."), nunca URLs absolutas ni "//host" (evita redirecciones abiertas).
 */
const EstadoLoginSchema = z
  .object({
    desde: z
      .string()
      .refine((ruta) => ruta.startsWith('/') && !ruta.startsWith('//'))
      .optional()
      .catch(undefined),
    motivo: z.literal('expirada').optional().catch(undefined),
    registrado: z.boolean().optional().catch(undefined),
  })
  .catch({})

export function leerEstadoLogin(state: unknown): EstadoLogin {
  const { desde, motivo, registrado } = EstadoLoginSchema.parse(state ?? {})
  return {
    ...(desde ? { desde } : {}),
    ...(motivo ? { motivo } : {}),
    ...(registrado ? { registrado } : {}),
  }
}
