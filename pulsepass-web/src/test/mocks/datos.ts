import type { Artista } from '../../funcionalidades/artistas/tipos'
import type { Rol } from '../../funcionalidades/auth/tipos'
import type { Evento } from '../../funcionalidades/eventos/tipos'
import type { Sede } from '../../funcionalidades/sedes/tipos'
import type { Ticket } from '../../funcionalidades/tickets/tipos'
import type { Usuario } from '../../funcionalidades/usuarios/tipos'

/**
 * Datos de referencia del escenario (PRD §22) en una "base" en memoria que cada prueba
 * reinicia. Las fechas son fijas: las pruebas no dependen del reloj del sistema.
 */

export interface UsuarioPrueba {
  perfil: Usuario
  password: string
  roles: Rol[]
}

const artistas = (): Artista[] => [
  { id: 1, stageName: 'Solar Beat', country: 'Colombia', genre: 'Electrónica', active: true },
  { id: 2, stageName: 'Neon Waves', country: 'México', genre: 'Synthpop', active: true },
  { id: 3, stageName: 'Caribbean Sound', country: 'Colombia', genre: 'Tropical', active: true },
]

const sedes = (): Sede[] => [
  {
    id: 1,
    code: 'VEN-SMR-01',
    name: 'Marina Convention Center',
    city: 'Santa Marta',
    address: 'Carrera 1 #10-20',
    capacity: 3,
    active: true,
  },
]

const evento = (parcial: Partial<Evento> & Pick<Evento, 'eventCode' | 'name'>): Evento => ({
  id: Math.floor(Math.random() * 100000),
  description: 'Tres noches de música caribeña frente a la bahía de Santa Marta.',
  category: 'MUSIC',
  status: 'PUBLISHED',
  eventDate: '2026-12-12T20:00:00',
  minimumAge: 18,
  venueCode: 'VEN-SMR-01',
  venueName: 'Marina Convention Center',
  artists: [],
  ...parcial,
})

const eventos = (): Evento[] => {
  const [solar, neon] = artistas()
  return [
    evento({
      id: 10,
      eventCode: 'CMF-2026',
      name: 'Caribbean Music Fest 2026',
      artists: [solar!, neon!],
    }),
    evento({
      id: 11,
      eventCode: 'TEC-2027',
      name: 'Cumbre Tech Caribe 2027',
      category: 'TECHNOLOGY',
      status: 'SOLD_OUT',
      eventDate: '2027-01-20T09:00:00',
      minimumAge: 0,
    }),
    evento({
      id: 12,
      eventCode: 'JAZZ-2026',
      name: 'Noche de Jazz y Cultura',
      category: 'CULTURE',
      eventDate: '2026-11-27T19:00:00',
      minimumAge: 0,
    }),
    evento({ id: 13, eventCode: 'DRAFT-2027', name: 'Festival Borrador', status: 'DRAFT' }),
  ]
}

const usuarios = (): UsuarioPrueba[] => [
  {
    perfil: {
      id: 100,
      username: 'andrea',
      email: 'andrea@pulsepass.test',
      active: true,
      firstName: 'Andrea',
      lastName: 'Ruiz',
      phone: null,
      city: 'Santa Marta',
      birthDate: '1998-04-12',
    },
    password: 'clave-segura-andrea',
    roles: ['USER'],
  },
  {
    perfil: {
      id: 101,
      username: 'carlos',
      email: 'carlos@pulsepass.test',
      active: true,
      firstName: 'Carlos',
      lastName: 'Peña',
      phone: null,
      city: null,
      birthDate: '1990-01-01',
    },
    password: 'clave-segura-carlos',
    roles: ['USER'],
  },
  {
    perfil: {
      id: 102,
      username: 'laura',
      email: 'laura@pulsepass.test',
      active: true,
      firstName: 'Laura',
      lastName: 'Gómez',
      phone: null,
      city: null,
      birthDate: '2009-06-01',
    },
    password: 'clave-segura-laura',
    roles: ['USER'],
  },
  {
    perfil: {
      id: 103,
      username: 'staff',
      email: 'staff@pulsepass.test',
      active: true,
      firstName: 'Sofía',
      lastName: 'Operación',
      phone: null,
      city: null,
      birthDate: '1985-03-03',
    },
    password: 'clave-segura-staff',
    roles: ['STAFF'],
  },
  {
    perfil: {
      id: 104,
      username: 'admin',
      email: 'admin@pulsepass.test',
      active: true,
      firstName: 'Ana',
      lastName: 'Admin',
      phone: null,
      city: null,
      birthDate: '1980-02-02',
    },
    password: 'clave-segura-admin',
    roles: ['ADMIN'],
  },
]

const tickets = (): Ticket[] => [
  {
    id: 1000,
    ticketCode: 'TCK-8F2A1C',
    type: 'VIP',
    price: 250000,
    status: 'PAID',
    purchaseDate: '2026-11-05T14:32:00',
    userEmail: 'andrea@pulsepass.test',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
  {
    id: 1001,
    ticketCode: 'TCK-USADO01',
    type: 'GENERAL',
    price: 120000,
    status: 'USED',
    purchaseDate: '2026-11-01T10:00:00',
    userEmail: 'andrea@pulsepass.test',
    eventCode: 'JAZZ-2026',
    eventName: 'Noche de Jazz y Cultura',
  },
  {
    id: 1002,
    ticketCode: 'TCK-91B07D',
    type: 'GENERAL',
    price: 120000,
    status: 'PAID',
    purchaseDate: '2026-11-06T09:00:00',
    userEmail: 'carlos@pulsepass.test',
    eventCode: 'CMF-2026',
    eventName: 'Caribbean Music Fest 2026',
  },
]

function crearDb() {
  return {
    artistas: artistas(),
    sedes: sedes(),
    eventos: eventos(),
    usuarios: usuarios(),
    tickets: tickets(),
    secuencia: 1,
  }
}

export let db = crearDb()

export function reiniciarDb(): void {
  db = crearDb()
}

/** Token de prueba: "token-<username>" (no es un JWT; MSW lo resuelve a un usuario). */
export const tokenDe = (username: string) => `token-${username}`

export function usuarioPorToken(cabecera: string | null): UsuarioPrueba | undefined {
  const token = cabecera?.replace(/^Bearer /, '')
  return db.usuarios.find((u) => tokenDe(u.perfil.username) === token)
}
