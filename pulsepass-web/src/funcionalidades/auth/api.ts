import { peticion } from '../../lib/http'
import { AuthResponseSchema, UsuarioAutenticadoSchema, type LoginForm } from './tipos'

export const iniciarSesionApi = (datos: LoginForm) =>
  peticion('/auth/login', AuthResponseSchema, { metodo: 'POST', cuerpo: datos })

/** Con token explícito: se usa justo tras el login o al restaurar la sesión. */
export const obtenerUsuarioAutenticado = (token: string) =>
  peticion('/auth/me', UsuarioAutenticadoSchema, { token })
