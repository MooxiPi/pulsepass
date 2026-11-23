import type { ComponentProps, ReactNode } from 'react'

/** Íconos SVG de trazo (DES-01). Decorativos por defecto: aria-hidden. */
type PropsIcono = ComponentProps<'svg'>

function Base({ children, className = 'size-5', ...props }: PropsIcono & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoMusica = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </Base>
)
export const IconoDeporte = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3v18" />
  </Base>
)
export const IconoTecnologia = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Base>
)
export const IconoEducacion = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m2 9 10-5 10 5-10 5z" />
    <path d="M6 11v5c3 2 9 2 12 0v-5" />
  </Base>
)
export const IconoCultura = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m3 9 9-5 9 5" />
    <path d="M5 9v9M10 9v9M14 9v9M19 9v9M3 20h18" />
  </Base>
)
export const IconoEntretenimiento = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />
  </Base>
)
export const IconoCalendario = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </Base>
)
export const IconoUbicacion = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </Base>
)
export const IconoPersona = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </Base>
)
export const IconoEdificio = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 21V9l8-5 8 5v12" />
    <path d="M9 21v-6h6v6" />
  </Base>
)
export const IconoFlechaIzquierda = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Base>
)
export const IconoFlechaDerecha = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
)
export const IconoBuscar = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Base>
)
export const IconoMenu = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Base>
)
export const IconoCerrar = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
)
export const IconoAlerta = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 3 2 20h20z" />
    <path d="M12 10v4M12 17h.01" />
  </Base>
)
export const IconoCheck = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m5 12 5 5 9-10" />
  </Base>
)
export const IconoInfo = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Base>
)
export const IconoTicket = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z" />
    <path d="M13 6v12" strokeDasharray="2 2" />
  </Base>
)
export const IconoChevronAbajo = (p: PropsIcono) => (
  <Base {...p}>
    <path d="m6 9 6 6 6-6" />
  </Base>
)
export const IconoOjo = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Base>
)
export const IconoOjoTachado = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Base>
)
export const IconoSol = (p: PropsIcono) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Base>
)
export const IconoLuna = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z" />
  </Base>
)
export const IconoCopiar = (p: PropsIcono) => (
  <Base {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </Base>
)
export const IconoMas = (p: PropsIcono) => (
  <Base {...p}>
    <path d="M12 5v14M5 12h14" />
  </Base>
)
