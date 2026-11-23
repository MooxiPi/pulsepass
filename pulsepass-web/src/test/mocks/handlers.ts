import { http, HttpResponse } from 'msw'
import { db, tokenDe, usuarioPorToken, type UsuarioPrueba } from './datos'

/**
 * Handlers MSW de los 23 endpoints (20 de la Fase 3 + login, me y registro con password).
 * Simulan el contrato real: ErrorResponse, 401/403/404/409 y políticas de visibilidad.
 * Las reglas de negocio aquí solo existen para producir respuestas realistas en las pruebas.
 */

const API = '*/api'

export function error(status: number, message: string, details: Record<string, string> = {}) {
  const textos: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    500: 'Internal Server Error',
  }
  return HttpResponse.json(
    {
      timestamp: '2026-11-08T10:00:00',
      status,
      error: textos[status] ?? 'Error',
      message,
      details,
    },
    { status },
  )
}

type Autenticacion = { usuario: UsuarioPrueba } | { respuesta: Response }

/** Igual que el backend: Bearer inválido → 401 incluso en rutas públicas. */
function autenticar(request: Request, obligatorio: boolean): Autenticacion | null {
  const cabecera = request.headers.get('Authorization')
  if (!cabecera) {
    return obligatorio
      ? { respuesta: error(401, 'Authentication required or invalid credentials') }
      : null
  }
  const usuario = usuarioPorToken(cabecera)
  if (!usuario) return { respuesta: error(401, 'Authentication required or invalid credentials') }
  return { usuario }
}

const tieneRol = (usuario: UsuarioPrueba | undefined, ...roles: string[]) =>
  Boolean(usuario?.roles.some((rol) => roles.includes(rol)))

const resumen = (e: (typeof db.eventos)[number]) => ({
  id: e.id,
  eventCode: e.eventCode,
  name: e.name,
  category: e.category,
  status: e.status,
  eventDate: e.eventDate,
  venueName: e.venueName,
})

const PRECIOS = { GENERAL: 120000, STUDENT: 80000, VIP: 250000, BACKSTAGE: 400000 } as const

export const handlers = [
  // ---------- Auth (Fase 4) ----------
  http.post(`${API}/auth/login`, async ({ request }) => {
    const cuerpo = (await request.json()) as { identifier?: string; password?: string }
    const usuario = db.usuarios.find(
      (u) => u.perfil.username === cuerpo.identifier || u.perfil.email === cuerpo.identifier,
    )
    if (!usuario || usuario.password !== cuerpo.password || !usuario.perfil.active) {
      return error(401, 'Authentication required or invalid credentials')
    }
    return HttpResponse.json({
      accessToken: tokenDe(usuario.perfil.username),
      tokenType: 'Bearer',
      expiresIn: 900,
    })
  }),
  http.get(`${API}/auth/me`, ({ request }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const { perfil, roles } = auth.usuario
    return HttpResponse.json({
      userId: perfil.id,
      username: perfil.username,
      email: perfil.email,
      roles,
    })
  }),

  // ---------- Venues ----------
  http.get(`${API}/venues/active`, ({ request }) => {
    const auth = autenticar(request, false)
    if (auth && 'respuesta' in auth) return auth.respuesta
    return HttpResponse.json(db.sedes.filter((s) => s.active))
  }),
  http.get(`${API}/venues/:code`, ({ params }) => {
    const sede = db.sedes.find((s) => s.code === params.code)
    return sede ? HttpResponse.json(sede) : error(404, `Venue not found: ${String(params.code)}`)
  }),

  // ---------- Artists ----------
  http.get(`${API}/artists/active`, () => HttpResponse.json(db.artistas.filter((a) => a.active))),
  http.get(`${API}/artists/by-stage-name`, ({ request }) => {
    const nombre = new URL(request.url).searchParams.get('stageName')
    const artista = db.artistas.find((a) => a.stageName === nombre)
    return artista ? HttpResponse.json(artista) : error(404, `Artist not found: ${nombre}`)
  }),
  http.get(`${API}/artists/:id`, ({ params }) => {
    const artista = db.artistas.find((a) => String(a.id) === params.id)
    return artista ? HttpResponse.json(artista) : error(404, 'Artist not found')
  }),

  // ---------- Events ----------
  http.get(`${API}/events/published`, ({ request }) => {
    const auth = autenticar(request, false)
    if (auth && 'respuesta' in auth) return auth.respuesta
    return HttpResponse.json(db.eventos.filter((e) => e.status === 'PUBLISHED').map(resumen))
  }),
  http.get(`${API}/events/by-artist`, ({ request }) => {
    const auth = autenticar(request, false)
    if (auth && 'respuesta' in auth) return auth.respuesta
    const nombre = new URL(request.url).searchParams.get('stageName')
    const operador = tieneRol(auth?.usuario, 'STAFF', 'ADMIN')
    return HttpResponse.json(
      db.eventos
        .filter((e) => e.artists.some((a) => a.stageName === nombre))
        .filter((e) => e.status === 'PUBLISHED' || operador)
        .map(resumen),
    )
  }),
  http.get(`${API}/events/:eventCode/tickets/paid`, ({ request, params }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    if (!tieneRol(auth.usuario, 'STAFF', 'ADMIN')) return error(403, 'Access denied')
    return HttpResponse.json(
      db.tickets.filter((t) => t.eventCode === params.eventCode && t.status === 'PAID'),
    )
  }),
  http.get(`${API}/events/:eventCode`, ({ request, params }) => {
    const auth = autenticar(request, false)
    if (auth && 'respuesta' in auth) return auth.respuesta
    const evento = db.eventos.find((e) => e.eventCode === params.eventCode)
    const visible =
      evento &&
      (evento.status === 'PUBLISHED' ||
        evento.status === 'SOLD_OUT' ||
        tieneRol(auth?.usuario, 'STAFF', 'ADMIN'))
    return visible ? HttpResponse.json(evento) : error(404, 'Event not found')
  }),
  http.post(`${API}/events`, async ({ request }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    if (!tieneRol(auth.usuario, 'ADMIN')) return error(403, 'Access denied')
    const cuerpo = (await request.json()) as Record<string, unknown>
    if (db.eventos.some((e) => e.eventCode === cuerpo.eventCode)) {
      return error(409, `Event code already exists: ${String(cuerpo.eventCode)}`)
    }
    const sede = db.sedes.find((s) => s.code === cuerpo.venueCode)
    if (!sede) return error(404, 'Venue not found')
    const nuevo = {
      id: 500 + db.secuencia++,
      eventCode: String(cuerpo.eventCode),
      name: String(cuerpo.name),
      description: (cuerpo.description as string | null) ?? null,
      category: cuerpo.category as (typeof db.eventos)[number]['category'],
      status: 'DRAFT' as const,
      eventDate: String(cuerpo.eventDate),
      minimumAge: Number(cuerpo.minimumAge),
      venueCode: sede.code,
      venueName: sede.name,
      artists: [],
    }
    db.eventos.push(nuevo)
    return HttpResponse.json(nuevo, { status: 201 })
  }),
  http.patch(`${API}/events/:eventCode/publish`, ({ request, params }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    if (!tieneRol(auth.usuario, 'ADMIN')) return error(403, 'Access denied')
    const evento = db.eventos.find((e) => e.eventCode === params.eventCode)
    if (!evento) return error(404, 'Event not found')
    if (evento.status !== 'DRAFT') return error(409, 'Only DRAFT events can be published.')
    evento.status = 'PUBLISHED'
    return HttpResponse.json(evento)
  }),
  http.post(`${API}/events/:eventCode/artists/:artistId`, ({ request, params }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    if (!tieneRol(auth.usuario, 'ADMIN')) return error(403, 'Access denied')
    const evento = db.eventos.find((e) => e.eventCode === params.eventCode)
    const artista = db.artistas.find((a) => String(a.id) === params.artistId)
    if (!evento || !artista) return error(404, 'Not found')
    if (evento.artists.some((a) => a.id === artista.id)) {
      return error(409, 'Artist is already associated with this event.')
    }
    evento.artists.push(artista)
    return HttpResponse.json(evento)
  }),

  // ---------- Users ----------
  http.post(`${API}/users`, async ({ request }) => {
    const cuerpo = (await request.json()) as Record<string, string>
    if (
      db.usuarios.some(
        (u) => u.perfil.username === cuerpo.username || u.perfil.email === cuerpo.email,
      )
    ) {
      return error(409, `Email already exists: ${cuerpo.email}`)
    }
    const perfil = {
      id: 900 + db.secuencia++,
      username: cuerpo.username ?? '',
      email: cuerpo.email ?? '',
      active: true,
      firstName: cuerpo.firstName ?? '',
      lastName: cuerpo.lastName ?? '',
      phone: null,
      city: null,
      birthDate: cuerpo.birthDate ?? null,
    }
    db.usuarios.push({ perfil, password: cuerpo.password ?? '', roles: ['USER'] })
    return HttpResponse.json(perfil, { status: 201 })
  }),
  http.get(`${API}/users/by-email`, ({ request }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const email = new URL(request.url).searchParams.get('email')
    if (auth.usuario.perfil.email !== email && !tieneRol(auth.usuario, 'ADMIN')) {
      return error(403, 'Access denied')
    }
    const usuario = db.usuarios.find((u) => u.perfil.email === email)
    return usuario ? HttpResponse.json(usuario.perfil) : error(404, 'User not found')
  }),
  http.get(`${API}/users/by-username`, ({ request }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const username = new URL(request.url).searchParams.get('username')
    if (auth.usuario.perfil.username !== username && !tieneRol(auth.usuario, 'ADMIN')) {
      return error(403, 'Access denied')
    }
    const usuario = db.usuarios.find((u) => u.perfil.username === username)
    return usuario ? HttpResponse.json(usuario.perfil) : error(404, 'User not found')
  }),

  // ---------- Tickets ----------
  http.post(`${API}/tickets`, async ({ request }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const cuerpo = (await request.json()) as {
      userEmail: string
      eventCode: string
      type: keyof typeof PRECIOS
    }
    if (!tieneRol(auth.usuario, 'USER') || auth.usuario.perfil.email !== cuerpo.userEmail) {
      return error(403, 'Access denied')
    }
    const evento = db.eventos.find((e) => e.eventCode === cuerpo.eventCode)
    if (!evento) return error(404, 'Event not found')
    if (evento.status !== 'PUBLISHED')
      return error(409, 'Tickets can only be purchased for published events.')
    if (auth.usuario.perfil.username === 'laura' && (evento.minimumAge ?? 0) >= 18) {
      return error(409, 'User does not meet minimum age.')
    }
    const ticket = {
      id: 2000 + db.secuencia,
      ticketCode: `TCK-NUEVO${db.secuencia++}`,
      type: cuerpo.type,
      price: PRECIOS[cuerpo.type],
      status: 'PAID' as const,
      purchaseDate: '2026-11-08T12:00:00',
      userEmail: cuerpo.userEmail,
      eventCode: evento.eventCode,
      eventName: evento.name,
    }
    db.tickets.push(ticket)
    return HttpResponse.json(ticket, { status: 201 })
  }),
  http.get(`${API}/tickets/by-user`, ({ request }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const email = new URL(request.url).searchParams.get('email')
    if (auth.usuario.perfil.email !== email && !tieneRol(auth.usuario, 'ADMIN')) {
      return error(403, 'Access denied')
    }
    return HttpResponse.json(db.tickets.filter((t) => t.userEmail === email))
  }),
  http.get(`${API}/tickets/:ticketCode`, ({ request, params }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const ticket = db.tickets.find((t) => t.ticketCode === params.ticketCode)
    const operador = tieneRol(auth.usuario, 'STAFF', 'ADMIN')
    if (!operador && ticket?.userEmail !== auth.usuario.perfil.email)
      return error(403, 'Access denied')
    return ticket ? HttpResponse.json(ticket) : error(404, 'Ticket not found')
  }),
  http.patch(`${API}/tickets/:ticketCode/cancel`, ({ request, params }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    const ticket = db.tickets.find((t) => t.ticketCode === params.ticketCode)
    if (!ticket) return error(404, 'Ticket not found')
    if (ticket.userEmail !== auth.usuario.perfil.email && !tieneRol(auth.usuario, 'ADMIN')) {
      return error(403, 'Access denied')
    }
    if (ticket.status !== 'PAID') return error(409, 'Only PAID tickets can be cancelled.')
    ticket.status = 'CANCELLED'
    return HttpResponse.json(ticket)
  }),
  http.patch(`${API}/tickets/:ticketCode/use`, ({ request, params }) => {
    const auth = autenticar(request, true)
    if (!auth || 'respuesta' in auth) return auth?.respuesta
    if (!tieneRol(auth.usuario, 'STAFF', 'ADMIN')) return error(403, 'Access denied')
    const ticket = db.tickets.find((t) => t.ticketCode === params.ticketCode)
    if (!ticket) return error(404, 'Ticket not found')
    if (ticket.status !== 'PAID') return error(409, 'Only PAID tickets can be marked as used.')
    ticket.status = 'USED'
    return HttpResponse.json(ticket)
  }),
]
