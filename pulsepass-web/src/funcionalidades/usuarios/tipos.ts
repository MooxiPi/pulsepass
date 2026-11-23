import { z } from 'zod'

/** UserResponse (Fase 2/3; nunca incluye hash ni credenciales). */
export const UsuarioSchema = z.object({
  id: z.number().int(),
  username: z.string(),
  email: z.string(),
  active: z.boolean(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  city: z.string().nullable(),
  birthDate: z.string().nullable(),
})
export type Usuario = z.infer<typeof UsuarioSchema>

const codificador = new TextEncoder()

/** Fecha local de hoy en formato yyyy-mm-dd (comparable con el valor de <input type="date">). */
export function hoyIso(ahora: Date = new Date()): string {
  const mes = String(ahora.getMonth() + 1).padStart(2, '0')
  const dia = String(ahora.getDate()).padStart(2, '0')
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

/**
 * Formulario de registro (§11). La contraseña replica la política estructural de la
 * Fase 4 (≥ 12 caracteres, ≤ 72 bytes UTF-8); la edad mínima NO se valida aquí.
 */
export const RegistroSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, 'Ingresa un nombre de usuario')
    .max(80, 'Máximo 80 caracteres')
    .refine((valor) => !valor.includes('@'), 'El nombre de usuario no puede contener @'),
  email: z.email('Ingresa un correo válido').max(200, 'Máximo 200 caracteres'),
  firstName: z.string().trim().min(1, 'Ingresa tus nombres').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().trim().min(1, 'Ingresa tus apellidos').max(100, 'Máximo 100 caracteres'),
  birthDate: z
    .string()
    .min(1, 'Ingresa tu fecha de nacimiento')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida')
    .refine((valor) => valor <= hoyIso(), 'La fecha de nacimiento no puede ser futura'),
  password: z
    .string()
    .refine((valor) => [...valor].length >= 12, 'La contraseña debe tener al menos 12 caracteres')
    .refine(
      (valor) => codificador.encode(valor).length <= 72,
      'La contraseña no puede superar 72 bytes',
    ),
})
export type RegistroForm = z.infer<typeof RegistroSchema>

/** RegisterUserRequest: no existe campo de rol; el backend asigna USER. */
export type RegistroRequest = RegistroForm
