import { z } from 'zod'
import { peticion, segmento } from '../../lib/http'
import { ArtistaSchema } from './tipos'

export const obtenerArtistasActivos = () => peticion('/artists/active', z.array(ArtistaSchema))

export const obtenerArtista = (id: number) => peticion(`/artists/${segmento(id)}`, ArtistaSchema)

export const obtenerArtistaPorNombre = (stageName: string) =>
  peticion('/artists/by-stage-name', ArtistaSchema, { query: { stageName } })
