import { z } from 'zod'

export const RolSchema = z.enum(['USER', 'STAFF', 'ADMIN'])
export type Rol = z.infer<typeof RolSchema>

/** LoginRequest (Fase 4). Validación estructural: campos no vacíos. */
export const LoginSchema = z.object({
  identifier: z.string().trim().min(1, 'Ingresa tu usuario o correo'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
export type LoginForm = z.infer<typeof LoginSchema>

/** AuthResponse (Fase 4). */
export const AuthResponseSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
  expiresIn: z.number().int().positive(),
})
export type AuthResponse = z.infer<typeof AuthResponseSchema>

/**
 * AuthenticatedUserResponse (GET /api/auth/me). Roles desconocidos se descartan para que
 * la UI nunca conceda accesos que no entiende.
 */
export const UsuarioAutenticadoSchema = z.object({
  userId: z.number().int(),
  username: z.string(),
  email: z.string(),
  roles: z
    .array(z.string())
    .transform((roles) => roles.filter((rol): rol is Rol => RolSchema.safeParse(rol).success)),
})
export type UsuarioAutenticado = z.infer<typeof UsuarioAutenticadoSchema>

/** Lo que se guarda en sessionStorage: solo token y vencimiento (se valida al arrancar). */
export const SesionGuardadaSchema = z.object({
  token: z.string().min(1),
  expiraEn: z.number().int().positive(),
})
export type SesionGuardada = z.infer<typeof SesionGuardadaSchema>

/** Sesión como unión discriminada (FE-006). */
export type Sesion =
  | { estado: 'cargando' }
  | { estado: 'anonimo'; motivo?: 'expirada' }
  | { estado: 'autenticado'; token: string; expiraEn: number; usuario: UsuarioAutenticado }
