import { useState } from 'react'
import Boton from '../componentes/Boton'
import Cargando from '../componentes/Cargando'
import EnlaceBoton from '../componentes/EnlaceBoton'
import EstadoError from '../componentes/EstadoError'
import FiltroChips from '../componentes/FiltroChips'
import { useAuth, useSalir, useUsuarioActual } from '../funcionalidades/auth/hooks'
import TarjetaPerfil from '../funcionalidades/usuarios/componentes/TarjetaPerfil'
import { useUsuarioPorEmail, useUsuarioPorUsername } from '../funcionalidades/usuarios/hooks'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

type Fuente = 'email' | 'username'

/**
 * Mi cuenta — /cuenta (§9.10). Identidad de /api/auth/me + perfil de UserResponse.
 * Solo se consulta la identidad propia, por correo (por defecto) o por nombre de usuario
 * (GET /api/users/by-email y /by-username: operaciones 13 y 14 de la tabla 10.3).
 */
export default function Cuenta() {
  const usuario = useUsuarioActual()
  const { tieneRol } = useAuth()
  const salir = useSalir()
  const [fuente, setFuente] = useState<Fuente>('email')
  const porEmail = useUsuarioPorEmail(usuario.email, fuente === 'email')
  const porUsername = useUsuarioPorUsername(usuario.username, fuente === 'username')
  const perfil = fuente === 'email' ? porEmail : porUsername

  return (
    <Pagina estrecha className="space-y-6">
      <title>Mi cuenta · PulsePass</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>
        <FiltroChips
          etiqueta="Consultar perfil por"
          opciones={[
            { valor: 'email', etiqueta: 'Por correo' },
            { valor: 'username', etiqueta: 'Por usuario' },
          ]}
          seleccionado={fuente}
          onCambiar={setFuente}
        />
      </div>
      {perfil.isPending ? (
        <Cargando forma="lista" cantidad={1} etiqueta="Cargando perfil…" />
      ) : perfil.isError ? (
        <EstadoError
          mensaje={mensajeDeError(perfil.error)}
          onReintentar={() => void perfil.refetch()}
        />
      ) : (
        <TarjetaPerfil usuario={perfil.data} roles={usuario.roles} />
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        {tieneRol('USER') ? (
          <EnlaceBoton variante="secundario" to={RUTAS.misTickets}>
            Ver mis tickets
          </EnlaceBoton>
        ) : (
          <span />
        )}
        <Boton variante="peligro" onClick={() => void salir()}>
          Cerrar sesión
        </Boton>
      </div>
    </Pagina>
  )
}
