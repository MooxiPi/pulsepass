import { z } from 'zod'
import { ArtistaSchema } from '../artistas/tipos'

/** Enumeraciones del dominio (PRD §10.1) como uniones literales derivadas de zod. */
export const EventCategorySchema = z.enum([
  'MUSIC',
  'SPORTS',
  'TECHNOLOGY',
  'EDUCATION',
  'CULTURE',
  'ENTERTAINMENT',
])
export type EventCategory = z.infer<typeof EventCategorySchema>

export const EventStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'FINISHED'])
export type EventStatus = z.infer<typeof EventStatusSchema>

/** EventResponse (detalle). */
export const EventoSchema = z.object({
  id: z.number().int(),
  eventCode: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  minimumAge: z.number().int().nullable(),
  venueCode: z.string(),
  venueName: z.string(),
  artists: z.array(ArtistaSchema),
})
export type Evento = z.infer<typeof EventoSchema>

/** EventSummaryResponse (listas). */
export const EventoResumenSchema = z.object({
  id: z.number().int(),
  eventCode: z.string(),
  name: z.string(),
  category: EventCategorySchema,
  status: EventStatusSchema,
  eventDate: z.string(),
  venueName: z.string().nullable(),
})
export type EventoResumen = z.infer<typeof EventoResumenSchema>

/** Etiquetas visibles por categoría (los valores del enum se muestran tal cual en badges). */
export const ETIQUETAS_CATEGORIA: Record<EventCategory, string> = {
  MUSIC: 'Música',
  SPORTS: 'Deportes',
  TECHNOLOGY: 'Tecnología',
  EDUCATION: 'Educación',
  CULTURE: 'Cultura',
  ENTERTAINMENT: 'Entretenimiento',
}

export const LONGITUD_MAX_DESCRIPCION = 500

/**
 * Formulario de creación (validación estructural; las reglas de negocio —fecha futura,
 * sede activa, código duplicado— las decide el backend y llegan como 409).
 */
export const CrearEventoFormSchema = z.object({
  eventCode: z
    .string()
    .trim()
    .min(1, 'Ingresa el código del evento')
    .max(80, 'Máximo 80 caracteres'),
  name: z.string().trim().min(1, 'Ingresa el nombre del evento').max(180, 'Máximo 180 caracteres'),
  description: z
    .string()
    .max(LONGITUD_MAX_DESCRIPCION, `Máximo ${LONGITUD_MAX_DESCRIPCION} caracteres`),
  category: z.string().min(1, 'Selecciona una categoría').pipe(EventCategorySchema),
  eventDate: z.string().min(1, 'Selecciona la fecha y hora'),
  minimumAge: z
    .number({ error: 'Ingresa la edad mínima' })
    .int('La edad mínima debe ser un número entero')
    .min(0, 'La edad mínima no puede ser negativa'),
  venueCode: z.string().min(1, 'Selecciona una sede'),
})
export type CrearEventoForm = z.input<typeof CrearEventoFormSchema>
export type CrearEventoValidado = z.output<typeof CrearEventoFormSchema>

/** CreateEventRequest (Fase 3). */
export interface CrearEventoRequest {
  eventCode: string
  name: string
  description: string | null
  category: EventCategory
  eventDate: string
  minimumAge: number
  venueCode: string
}

/** Parámetro de ruta :eventCode. */
export const CodigoEventoSchema = z.string().trim().min(1).max(80)
