import Avatar from '../../../componentes/Avatar'
import Badge from '../../../componentes/Badge'
import Tarjeta from '../../../componentes/Tarjeta'
import { formatearFechaNumerica } from '../../../lib/formato'
import type { Rol } from '../../auth/tipos'
import type { Usuario } from '../tipos'

/** Datos mínimos de la cuenta; nunca muestra hash, token ni claims (§9.10). */
export default function TarjetaPerfil({ usuario, roles }: { usuario: Usuario; roles: Rol[] }) {
  const nombre = `${usuario.firstName} ${usuario.lastName}`
  return (
    <Tarjeta className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
      <Avatar nombre={nombre} tamano="mediano" />
      <div className="flex-1 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">{nombre}</h2>
          <p className="flex items-center gap-2 text-sm">
            Rol:
            {roles.map((rol) => (
              <Badge key={rol} tono="marca">
                {rol}
              </Badge>
            ))}
          </p>
        </div>
        <p className="text-slate-600 dark:text-slate-400">
          @{usuario.username} · {usuario.email}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {usuario.birthDate ? (
            <p>Nacimiento: {formatearFechaNumerica(usuario.birthDate)}</p>
          ) : null}
          <p className="flex items-center gap-2">
            Estado:
            <Badge tono={usuario.active ? 'verde' : 'gris'}>
              {usuario.active ? 'Activa' : 'Inactiva'}
            </Badge>
          </p>
        </div>
      </div>
    </Tarjeta>
  )
}
