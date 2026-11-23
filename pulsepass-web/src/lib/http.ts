import { z } from 'zod'

/**
 * Cliente HTTP único de la aplicación (PRD §5 y §13).
 * - Añade `Authorization: Bearer <token>` cuando hay sesión (nunca en la URL).
 * - Convierte toda respuesta no exitosa en `ApiError` validando `ErrorResponse` con zod.
 * - Valida con zod el cuerpo de las respuestas exitosas.
 * - Un 401 en una petición que llevaba token cierra la sesión local.
 */

export const ErrorResponseSchema = z.object({
  timestamp: z.string().optional(),
  status: z.number().int(),
  error: z.string().optional(),
  message: z.string(),
  details: z.record(z.string(), z.string()).nullish(),
})

/** Estado 0 = fallo de red (sin respuesta del servidor). */
export const ESTADO_RED = 0

export class ApiError extends Error {
  readonly status: number
  readonly details: Record<string, string>

  constructor(status: number, message: string, details: Record<string, string> = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

interface ConfiguracionHttp {
  obtenerToken: () => string | null
  alNoAutorizado: () => void
}

let configuracion: ConfiguracionHttp = {
  obtenerToken: () => null,
  alNoAutorizado: () => {},
}

/** AuthProvider registra aquí cómo leer el token y qué hacer ante un 401. */
export function configurarHttp(nueva: ConfiguracionHttp): void {
  configuracion = nueva
}

type Metodo = 'GET' | 'POST' | 'PATCH'

export interface OpcionesPeticion {
  metodo?: Metodo
  cuerpo?: unknown
  query?: Record<string, string>
  /** Token explícito (p. ej. justo después del login, antes de guardar la sesión). */
  token?: string
}

const BASE_API = import.meta.env.VITE_API_BASE_URL || '/api'

function construirUrl(ruta: string, query?: Record<string, string>): string {
  const url = new URL(`${BASE_API}${ruta}`, window.location.origin)
  for (const [clave, valor] of Object.entries(query ?? {})) url.searchParams.set(clave, valor)
  return url.toString()
}

/** Codifica un segmento de ruta (códigos de evento, ticket, sede…). */
export function segmento(valor: string | number): string {
  return encodeURIComponent(String(valor))
}

async function leerJson(respuesta: Response): Promise<unknown> {
  const texto = await respuesta.text()
  if (!texto) return null
  try {
    return JSON.parse(texto) as unknown
  } catch {
    return null
  }
}

export async function peticion<T>(
  ruta: string,
  esquema: z.ZodType<T>,
  opciones: OpcionesPeticion = {},
): Promise<T> {
  const token = opciones.token ?? configuracion.obtenerToken()
  const cabeceras: Record<string, string> = { Accept: 'application/json' }
  if (opciones.cuerpo !== undefined) cabeceras['Content-Type'] = 'application/json'
  if (token) cabeceras.Authorization = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(construirUrl(ruta, opciones.query), {
      method: opciones.metodo ?? 'GET',
      headers: cabeceras,
      body: opciones.cuerpo === undefined ? undefined : JSON.stringify(opciones.cuerpo),
    })
  } catch {
    throw new ApiError(ESTADO_RED, 'No pudimos conectar con el servidor.')
  }

  const cuerpo = await leerJson(respuesta)

  if (!respuesta.ok) {
    const error = ErrorResponseSchema.safeParse(cuerpo)
    const apiError = error.success
      ? new ApiError(respuesta.status, error.data.message, error.data.details ?? {})
      : new ApiError(respuesta.status, 'Ocurrió un error inesperado. Inténtalo más tarde.')
    // Solo un 401 de una petición autenticada significa sesión vencida/inválida;
    // el 401 del login (credenciales inválidas) se maneja en el formulario.
    if (respuesta.status === 401 && token && !opciones.token) configuracion.alNoAutorizado()
    throw apiError
  }

  const datos = esquema.safeParse(cuerpo)
  if (!datos.success) {
    throw new ApiError(500, 'La respuesta del servidor no tiene el formato esperado.')
  }
  return datos.data
}
