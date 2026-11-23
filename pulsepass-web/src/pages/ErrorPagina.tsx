import { isRouteErrorResponse, useRouteError } from 'react-router'
import Boton from '../componentes/Boton'
import EnlaceBoton from '../componentes/EnlaceBoton'
import MensajePagina from '../componentes/MensajePagina'
import { RUTAS } from '../lib/rutas'

/**
 * errorElement de la ruta raíz (§9.19). Muestra un mensaje seguro: nunca el stack
 * ni el mensaje interno del error.
 */
export default function ErrorPagina() {
  const error = useRouteError()

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <MensajePagina codigo="404" titulo="No encontramos esta página" />
  }

  return (
    <div className="px-4">
      <title>Algo salió mal · PulsePass</title>
      <MensajePagina
        titulo="¡Ups! Algo salió mal."
        descripcion="Ocurrió un error inesperado al cargar esta página. Inténtalo de nuevo."
        acciones={
          <>
            <Boton onClick={() => window.location.reload()}>Reintentar</Boton>
            <EnlaceBoton variante="secundario" to={RUTAS.inicio} reloadDocument>
              Volver al inicio
            </EnlaceBoton>
          </>
        }
      />
    </div>
  )
}
