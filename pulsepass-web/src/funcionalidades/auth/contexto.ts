import { createContext } from 'react'
import type { LoginForm, Rol, Sesion, UsuarioAutenticado } from './tipos'

export interface ValorAuth {
  sesion: Sesion
  iniciarSesion: (datos: LoginForm) => Promise<UsuarioAutenticado>
  cerrarSesion: () => void
  tieneRol: (...roles: Rol[]) => boolean
}

export const AuthContexto = createContext<ValorAuth | null>(null)
