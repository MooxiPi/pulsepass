import { z } from 'zod'

/** VenueResponse (Fase 2/3). */
export const SedeSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string().nullable(),
  capacity: z.number().int(),
  active: z.boolean(),
})
export type Sede = z.infer<typeof SedeSchema>
