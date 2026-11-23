import { z } from 'zod'
import { peticion, segmento } from '../../lib/http'
import { SedeSchema } from './tipos'

export const obtenerSedesActivas = () => peticion('/venues/active', z.array(SedeSchema))

export const obtenerSede = (code: string) => peticion(`/venues/${segmento(code)}`, SedeSchema)
