import { z } from 'zod'

/** ArtistResponse (Fase 2/3). */
export const ArtistaSchema = z.object({
  id: z.number().int(),
  stageName: z.string(),
  country: z.string().nullable(),
  genre: z.string().nullable(),
  active: z.boolean(),
})
export type Artista = z.infer<typeof ArtistaSchema>

/** Parámetro :id de /artistas/:id (FE-002: los parámetros de URL también se validan). */
export const IdArtistaSchema = z.coerce.number().int().positive()
