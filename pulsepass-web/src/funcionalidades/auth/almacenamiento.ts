import { SesionGuardadaSchema, type SesionGuardada } from './tipos'

/**
 * Persistencia del token mientras dure la pestaña (PRD §12.2): solo sessionStorage,
 * nunca localStorage ni cookies. Lo leído se valida con zod y se descarta si expiró.
 */
const CLAVE = 'pulsepass.sesion'

export function leerSesionGuardada(ahora: number = Date.now()): SesionGuardada | null {
  try {
    const crudo = window.sessionStorage.getItem(CLAVE)
    if (!crudo) return null
    const resultado = SesionGuardadaSchema.safeParse(JSON.parse(crudo))
    if (!resultado.success || resultado.data.expiraEn <= ahora) {
      borrarSesionGuardada()
      return null
    }
    return resultado.data
  } catch {
    borrarSesionGuardada()
    return null
  }
}

export function guardarSesion(sesion: SesionGuardada): void {
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(sesion))
  } catch {
    // Sin almacenamiento: la sesión vive solo en memoria.
  }
}

export function borrarSesionGuardada(): void {
  try {
    window.sessionStorage.removeItem(CLAVE)
  } catch {
    // Nada que borrar.
  }
}
