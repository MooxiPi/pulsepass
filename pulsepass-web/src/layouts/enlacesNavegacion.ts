import { RUTAS } from '../lib/rutas'
import type { Rol } from '../funcionalidades/auth/tipos'

export interface EnlaceNav {
  a: string
  texto: string
  /** Roles que ven el enlace; sin roles = todos (tabla 8.4). */
  roles?: Rol[]
  fin?: boolean
}

export const ENLACES_PUBLICOS: EnlaceNav[] = [
  { a: RUTAS.eventos, texto: 'Eventos' },
  { a: RUTAS.artistas, texto: 'Artistas' },
  { a: RUTAS.sedes, texto: 'Sedes' },
]

export const ENLACES_POR_ROL: EnlaceNav[] = [
  { a: RUTAS.misTickets, texto: 'Mis tickets', roles: ['USER'] },
  { a: RUTAS.validacionIngreso, texto: 'Validar ingreso', roles: ['STAFF', 'ADMIN'], fin: true },
  {
    a: `${RUTAS.validacionIngreso}#tickets-pagados`,
    texto: 'Tickets pagados',
    roles: ['STAFF', 'ADMIN'],
  },
  { a: RUTAS.adminEventos, texto: 'Administrar eventos', roles: ['ADMIN'] },
]
