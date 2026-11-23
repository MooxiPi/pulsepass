import { z } from 'zod'
import { peticion, segmento } from '../../lib/http'
import { EventoResumenSchema, EventoSchema, type CrearEventoRequest } from './tipos'

export const obtenerEventosPublicados = () =>
  peticion('/events/published', z.array(EventoResumenSchema))

export const obtenerEvento = (eventCode: string) =>
  peticion(`/events/${segmento(eventCode)}`, EventoSchema)

export const obtenerEventosPorArtista = (stageName: string) =>
  peticion('/events/by-artist', z.array(EventoResumenSchema), { query: { stageName } })

export const crearEvento = (datos: CrearEventoRequest) =>
  peticion('/events', EventoSchema, { metodo: 'POST', cuerpo: datos })

export const publicarEvento = (eventCode: string) =>
  peticion(`/events/${segmento(eventCode)}/publish`, EventoSchema, { metodo: 'PATCH' })

export const asociarArtista = (eventCode: string, artistId: number) =>
  peticion(`/events/${segmento(eventCode)}/artists/${segmento(artistId)}`, EventoSchema, {
    metodo: 'POST',
  })
