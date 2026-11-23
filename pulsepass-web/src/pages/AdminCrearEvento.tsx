import { Navigate, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import EnlaceVolver from '../componentes/EnlaceVolver'
import Tarjeta from '../componentes/Tarjeta'
import { useNotificar } from '../componentes/notificacionesContexto'
import FormularioEvento from '../funcionalidades/admin/componentes/FormularioEvento'
import { recordarEventoCreado } from '../funcionalidades/admin/eventosSesion'
import { useCrearEvento } from '../funcionalidades/eventos/hooks'
import type { CrearEventoValidado } from '../funcionalidades/eventos/tipos'
import { useSedesActivas } from '../funcionalidades/sedes/hooks'
import Pagina from '../layouts/Pagina'
import { esEstado, mensajeDeError } from '../lib/errores'
import { RUTAS } from '../lib/rutas'

/** Crear evento — /admin/eventos/nuevo (§9.17). */
export default function AdminCrearEvento() {
  const navigate = useNavigate()
  const notificar = useNotificar()
  const sedes = useSedesActivas()
  const crear = useCrearEvento()

  async function enviar(datos: CrearEventoValidado) {
    const evento = await crear.mutateAsync({
      ...datos,
      description: datos.description.trim() || null,
    })
    recordarEventoCreado({ eventCode: evento.eventCode, name: evento.name })
    notificar('exito', `Evento ${evento.eventCode} creado en borrador.`)
    navigate(RUTAS.adminEvento(evento.eventCode))
  }

  // 403 en la acción → /403 (§9.17).
  if (esEstado(crear.error, 403)) return <Navigate to={RUTAS.sinPermisos} replace />

  return (
    <Pagina estrecha className="space-y-4">
      <title>Nuevo evento · PulsePass</title>
      <EnlaceVolver a={RUTAS.adminEventos}>Eventos</EnlaceVolver>
      <Tarjeta className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Nuevo evento</h1>
        {sedes.isError ? <Aviso tono="error">{mensajeDeError(sedes.error)}</Aviso> : null}
        <FormularioEvento
          sedes={sedes.data ?? []}
          cargandoSedes={sedes.isPending}
          enviando={crear.isPending}
          onEnviar={enviar}
        />
      </Tarjeta>
    </Pagina>
  )
}
