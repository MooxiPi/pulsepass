import Cargando from '../componentes/Cargando'
import EstadoError from '../componentes/EstadoError'
import EstadoVacio from '../componentes/EstadoVacio'
import TarjetaSede from '../funcionalidades/sedes/componentes/TarjetaSede'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'

/** Sedes activas — /sedes (§9.7). */
export default function ListaSedes() {
  const sedes = useSedesActivas()
  return (
    <Pagina>
      <title>Sedes · PulsePass</title>
      <h1 className="mb-6 text-3xl font-bold">Sedes</h1>
      {sedes.isPending ? (
        <Cargando forma="lista" etiqueta="Cargando sedes…" />
      ) : sedes.isError ? (
        <EstadoError
          mensaje={mensajeDeError(sedes.error)}
          onReintentar={() => void sedes.refetch()}
        />
      ) : sedes.data.length === 0 ? (
        <EstadoVacio titulo="Aún no hay sedes activas" />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sedes.data.map((sede) => (
            <li key={sede.code}>
              <TarjetaSede sede={sede} />
            </li>
          ))}
        </ul>
      )}
    </Pagina>
  )
}
