import type { Rol } from '../funcionalidades/auth/tipos'
import { Guarda } from './RutaProtegida'

/** Requiere sesión y alguno de los roles indicados (§12.3). */
export default function RutaPorRol({ roles }: { roles: Rol[] }) {
  return <Guarda roles={roles} />
}
