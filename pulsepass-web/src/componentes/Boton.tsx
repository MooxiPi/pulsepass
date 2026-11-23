import clsx from 'clsx'
import type { ComponentProps } from 'react'
import {
  CLASES_BASE_BOTON,
  CLASES_BOTON_DESHABILITADO,
  TAMANOS_BOTON,
  VARIANTES_BOTON,
  type TamanoBoton,
  type VarianteBoton,
} from './estilos'

interface PropsBoton extends ComponentProps<'button'> {
  variante?: VarianteBoton
  tamano?: TamanoBoton
  cargando?: boolean
  textoCargando?: string
}

/** Botón con variantes (DES-09) y estado "Cargando..." que evita doble envío. */
export default function Boton({
  variante = 'primario',
  tamano = 'normal',
  cargando = false,
  textoCargando = 'Cargando...',
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: PropsBoton) {
  const deshabilitado = disabled || cargando
  return (
    <button
      type={type}
      disabled={deshabilitado}
      aria-busy={cargando || undefined}
      className={clsx(
        CLASES_BASE_BOTON,
        TAMANOS_BOTON[tamano],
        deshabilitado ? CLASES_BOTON_DESHABILITADO : VARIANTES_BOTON[variante],
        className,
      )}
      {...props}
    >
      {cargando ? textoCargando : children}
    </button>
  )
}
