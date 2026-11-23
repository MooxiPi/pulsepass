import { useSyncExternalStore } from 'react'
import { z } from 'zod'

/**
 * GAP-01: la API no lista todos los eventos. Los creados en esta pestaña se recuerdan
 * en sessionStorage (se pierden al cerrarla; limitación documentada en §9.16).
 */
const CLAVE = 'pulsepass.admin.eventosCreados'

const EventoCreadoSchema = z.object({ eventCode: z.string(), name: z.string() })
const ListaSchema = z.array(EventoCreadoSchema)
export type EventoCreado = z.infer<typeof EventoCreadoSchema>

const VACIA: EventoCreado[] = []
let cache: { crudo: string | null; lista: EventoCreado[] } = { crudo: null, lista: VACIA }
const oyentes = new Set<() => void>()

function leerCrudo(): string | null {
  try {
    return window.sessionStorage.getItem(CLAVE)
  } catch {
    return null
  }
}

function interpretar(crudo: string | null): EventoCreado[] {
  if (!crudo) return VACIA
  try {
    const resultado = ListaSchema.safeParse(JSON.parse(crudo))
    return resultado.success ? resultado.data : VACIA
  } catch {
    return VACIA
  }
}

/** Devuelve la misma referencia mientras el contenido no cambie (requisito de useSyncExternalStore). */
function leer(): EventoCreado[] {
  const crudo = leerCrudo()
  if (crudo !== cache.crudo) cache = { crudo, lista: interpretar(crudo) }
  return cache.lista
}

export function recordarEventoCreado(evento: EventoCreado): void {
  const actual = leer().filter((e) => e.eventCode !== evento.eventCode)
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify([evento, ...actual]))
  } catch {
    return
  }
  oyentes.forEach((oyente) => oyente())
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

export function useEventosCreadosEnSesion(): EventoCreado[] {
  return useSyncExternalStore(suscribir, leer, () => VACIA)
}
