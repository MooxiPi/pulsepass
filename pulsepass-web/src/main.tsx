import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import './index.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import ProveedorNotificaciones from './componentes/ProveedorNotificaciones'
import AuthProvider from './funcionalidades/auth/AuthContext'
import { crearQueryClient } from './lib/queryClient'
import { RUTAS, type EstadoLogin } from './lib/rutas'
import { crearRouter } from './router'

const queryClient = crearQueryClient()
const router = crearRouter()

/** 401 o vencimiento del token: volver a /login con aviso y regresar luego a la ruta actual. */
function alExpirarSesion() {
  const { pathname, search } = router.state.location
  const estado: EstadoLogin = { motivo: 'expirada', desde: pathname + search }
  void router.navigate(RUTAS.login, { replace: true, state: estado })
}

const raiz = document.getElementById('root')
if (!raiz) throw new Error('No se encontró el elemento #root')

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider onSesionExpirada={alExpirarSesion}>
        <ProveedorNotificaciones>
          <RouterProvider router={router} />
        </ProveedorNotificaciones>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
