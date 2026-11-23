import { useParams } from 'react-router'
import Badge from '../componentes/Badge'
import Cargando from '../componentes/Cargando'
import CodigoTexto from '../componentes/CodigoTexto'
import EnlaceVolver from '../componentes/EnlaceVolver'
import ErrorConsulta from '../componentes/ErrorConsulta'
import { IconoUbicacion } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useSede } from '../funcionalidades/sedes/hooks'
import Pagina from '../layouts/Pagina'
import { RUTAS } from '../lib/rutas'

/** Detalle de sede — /sedes/:code (§9.7). */
export default function DetalleSede() {
  const { code } = useParams()
  const sede = useSede(code?.trim())

  return (
    <Pagina estrecha>
      <div className="mb-4">
        <EnlaceVolver a={RUTAS.sedes}>Sedes</EnlaceVolver>
      </div>
      {sede.isPending ? (
        <Cargando forma="detalle" etiqueta="Cargando sede…" />
      ) : sede.isError ? (
        <ErrorConsulta error={sede.error} onReintentar={() => void sede.refetch()} />
      ) : (
        <Tarjeta className="space-y-4 p-6">
          <title>{`${sede.data.name} · PulsePass`}</title>
          <h1 className="text-3xl font-bold">{sede.data.name}</h1>
          <p className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
            <CodigoTexto>{sede.data.code}</CodigoTexto>
            <Badge tono={sede.data.active ? 'verde' : 'gris'}>
              {sede.data.active ? 'Activa' : 'Inactiva'}
            </Badge>
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
            <dt className="text-slate-500 dark:text-slate-400">Ciudad</dt>
            <dd className="flex items-center gap-2 font-medium">
              <IconoUbicacion className="size-4" />
              {sede.data.city}
            </dd>
            <dt className="text-slate-500 dark:text-slate-400">Capacidad</dt>
            <dd className="font-medium">{sede.data.capacity} personas</dd>
            {sede.data.address ? (
              <>
                <dt className="text-slate-500 dark:text-slate-400">Dirección</dt>
                <dd className="font-medium">{sede.data.address}</dd>
              </>
            ) : null}
          </dl>
        </Tarjeta>
      )}
    </Pagina>
  )
}
