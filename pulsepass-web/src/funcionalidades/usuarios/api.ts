import { peticion } from '../../lib/http'
import { UsuarioSchema, type RegistroRequest } from './tipos'

export const registrarUsuario = (datos: RegistroRequest) =>
  peticion('/users', UsuarioSchema, { metodo: 'POST', cuerpo: datos })

export const obtenerUsuarioPorEmail = (email: string) =>
  peticion('/users/by-email', UsuarioSchema, { query: { email } })

export const obtenerUsuarioPorUsername = (username: string) =>
  peticion('/users/by-username', UsuarioSchema, { query: { username } })
