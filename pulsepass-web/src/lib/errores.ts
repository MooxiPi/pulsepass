import { ApiError, ESTADO_RED } from './http'

/**
 * Mapeo uniforme HTTP → interfaz (PRD §13). Los mensajes se renderizan siempre como texto.
 * Los 409 muestran el mensaje del backend; se traducen los mensajes conocidos de la API
 * (que responde en inglés) sin reinterpretar la regla de negocio.
 */

const TRADUCCIONES: Record<string, string> = {
  'User does not meet minimum age.': 'El usuario no cumple la edad mínima del evento.',
  'Event has no available capacity.': 'El evento no tiene cupos disponibles.',
  'Tickets can only be purchased for published events.':
    'Solo se pueden comprar entradas de eventos publicados.',
  'Cannot purchase a ticket for an event that has already occurred.':
    'No se pueden comprar entradas de un evento que ya ocurrió.',
  'Inactive users cannot purchase tickets.': 'Los usuarios inactivos no pueden comprar entradas.',
  'User birth date is required.': 'Se requiere la fecha de nacimiento del usuario.',
  'Only PAID tickets can be cancelled.': 'Solo se pueden cancelar tickets pagados.',
  'Ticket cannot be cancelled after the event date.':
    'El ticket no se puede cancelar después de la fecha del evento.',
  'Only PAID tickets can be marked as used.': 'El ticket ya fue utilizado o no está pagado.',
  'Only DRAFT events can be published.': 'Solo se pueden publicar eventos en borrador (DRAFT).',
  'Cannot publish an event whose date is not in the future.':
    'No se puede publicar un evento cuya fecha ya pasó.',
  'Cannot publish an event with an inactive venue.':
    'No se puede publicar un evento con una sede inactiva.',
  'Cannot add artists to a cancelled or finished event.':
    'No se pueden asociar artistas a un evento cancelado o finalizado.',
  'Artist is already associated with this event.': 'El artista ya está asociado a este evento.',
  'Cannot create event in an inactive venue.': 'No se puede crear un evento en una sede inactiva.',
  'Event date must be in the future.': 'La fecha del evento debe ser futura.',
  'Minimum age cannot be negative.': 'La edad mínima no puede ser negativa.',
  'Birth date cannot be in the future.': 'La fecha de nacimiento no puede ser futura.',
  'Resource conflicts with existing data': 'El recurso entra en conflicto con datos existentes.',
}

const PREFIJOS: [string, string][] = [
  ['Event code already exists', 'Ya existe un evento con ese código.'],
  ['Username already exists', 'El usuario o correo ya está registrado.'],
  ['Email already exists', 'El usuario o correo ya está registrado.'],
  ['Email conflicts with an existing username', 'El usuario o correo ya está registrado.'],
]

export function traducirMensaje(mensaje: string): string {
  const exacto = TRADUCCIONES[mensaje]
  if (exacto) return exacto
  const prefijo = PREFIJOS.find(([inicio]) => mensaje.startsWith(inicio))
  return prefijo ? prefijo[1] : mensaje
}

export const MENSAJES = {
  red: 'No pudimos conectar con el servidor.',
  validacion: 'Revisa los datos del formulario.',
  sesionExpirada: 'Tu sesión expiró. Inicia sesión de nuevo.',
  sinPermisos: 'No tienes permisos para realizar esta acción.',
  noEncontrado: 'El recurso no existe o no está disponible.',
  inesperado: 'Ocurrió un error inesperado. Inténtalo más tarde.',
  credenciales: 'Credenciales inválidas.',
} as const

export function mensajeDeError(error: unknown): string {
  if (!(error instanceof ApiError)) return MENSAJES.inesperado
  switch (error.status) {
    case ESTADO_RED:
      return MENSAJES.red
    case 400:
      return MENSAJES.validacion
    case 401:
      return MENSAJES.sesionExpirada
    case 403:
      return MENSAJES.sinPermisos
    case 404:
      return MENSAJES.noEncontrado
    case 409:
      return traducirMensaje(error.message)
    default:
      return MENSAJES.inesperado
  }
}

export const esEstado = (error: unknown, ...estados: number[]): boolean =>
  error instanceof ApiError && estados.includes(error.status)
