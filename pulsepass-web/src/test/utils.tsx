import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { createMemoryRouter, type InitialEntry } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import ProveedorNotificaciones from '../componentes/ProveedorNotificaciones'
import AuthProvider from '../funcionalidades/auth/AuthContext'
import { RUTAS, type EstadoLogin } from '../lib/rutas'
import { rutas } from '../router'
import { tokenDe } from './mocks/datos'

export type UsuarioDemo = 'andrea' | 'carlos' | 'laura' | 'staff' | 'admin'

interface OpcionesRender {
  /** Simula una sesión previa guardada en sessionStorage. */
  usuario?: UsuarioDemo
  /** Vencimiento del token guardado (por defecto, dentro de 15 minutos). */
  expiraEn?: number
}

export function crearQueryClientPrueba(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  })
}

export function guardarSesionDePrueba(usuario: UsuarioDemo, expiraEn = Date.now() + 900_000) {
  window.sessionStorage.setItem(
    'pulsepass.sesion',
    JSON.stringify({ token: tokenDe(usuario), expiraEn }),
  )
}

/** Renderiza la aplicación real (rutas + Query + Auth + avisos) en un router en memoria. */
export function renderConProveedores(entrada: InitialEntry, opciones: OpcionesRender = {}) {
  if (opciones.usuario) guardarSesionDePrueba(opciones.usuario, opciones.expiraEn)
  const queryClient = crearQueryClientPrueba()
  const router = createMemoryRouter(rutas, { initialEntries: [entrada] })
  // Igual que main.tsx: redirige a /login con aviso y conserva la ruta de origen.
  const alExpirar = () => {
    const { pathname, search } = router.state.location
    const estado: EstadoLogin = { motivo: 'expirada', desde: pathname + search }
    void router.navigate(RUTAS.login, { replace: true, state: estado })
  }
  const utilidades = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider onSesionExpirada={alExpirar}>
        <ProveedorNotificaciones>
          <RouterProvider router={router} />
        </ProveedorNotificaciones>
      </AuthProvider>
    </QueryClientProvider>,
  )
  return { ...utilidades, router, queryClient, user: userEvent.setup() }
}

/** Envoltura mínima para probar hooks/componentes aislados. */
export function crearEnvoltura(queryClient = crearQueryClientPrueba()) {
  return function Envoltura({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}
