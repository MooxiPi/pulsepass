import { useNavigate } from 'react-router'
import BuscadorCodigo from '../componentes/BuscadorCodigo'
import EnlaceBoton from '../componentes/EnlaceBoton'
import { IconoMas } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import FilaEventoSesion from '../funcionalidades/admin/componentes/FilaEventoSesion'
import { useEventosCreadosEnSesion } from '../funcionalidades/admin/eventosSesion'
import Pagina from '../layouts/Pagina'
import { RUTAS } from '../lib/rutas'

/** Administración de eventos — /admin/eventos (§9.16, GAP-01). */
export default function AdminEventos() {
  const navigate = useNavigate()
  const creados = useEventosCreadosEnSesion()

  return (
    <Pagina estrecha className="space-y-8">
      <title>Administración de eventos · PulsePass</title>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Administración de eventos</h1>
        <EnlaceBoton to={RUTAS.adminCrearEvento}>
          <IconoMas className="size-4" />
          Nuevo evento
        </EnlaceBoton>
      </div>

      <BuscadorCodigo
        etiqueta="Buscar evento por código"
        textoBoton="Abrir"
        placeholder="CMF-2026"
        onBuscar={(codigo) => navigate(RUTAS.adminEvento(codigo))}
      />

      <section aria-labelledby="titulo-creados" className="space-y-3">
        <h2 id="titulo-creados" className="text-lg font-semibold">
          Creados en esta sesión
        </h2>
        {creados.length ? (
          <Tarjeta>
            <ul className="divide-y divide-slate-200 dark:divide-slate-800">
              {creados.map((evento) => (
                <FilaEventoSesion key={evento.eventCode} evento={evento} />
              ))}
            </ul>
          </Tarjeta>
        ) : (
          <p className="text-slate-600 dark:text-slate-400">
            Aún no has creado eventos en esta sesión.
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nota: la API no ofrece un listado completo de eventos (GAP-01). Esta lista se pierde al
          cerrar la pestaña.
        </p>
      </section>
    </Pagina>
  )
}
