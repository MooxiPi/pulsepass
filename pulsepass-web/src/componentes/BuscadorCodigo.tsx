import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Boton from './Boton'
import Campo from './Campo'

const BusquedaSchema = z.object({ codigo: z.string().trim().min(1, 'Ingresa un código') })
type Busqueda = z.infer<typeof BusquedaSchema>

interface PropsBuscadorCodigo {
  etiqueta: string
  textoBoton: string
  placeholder?: string
  autoFocus?: boolean
  /** Cambia para vaciar el campo (p. ej. tras validar un ingreso). */
  limpiarCon?: unknown
  onBuscar: (codigo: string) => void
}

/** Campo + botón para buscar por código (Enter busca). Código no vacío (zod). */
export default function BuscadorCodigo({
  etiqueta,
  textoBoton,
  placeholder,
  autoFocus = false,
  limpiarCon,
  onBuscar,
}: PropsBuscadorCodigo) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Busqueda>({ resolver: zodResolver(BusquedaSchema), defaultValues: { codigo: '' } })

  useEffect(() => {
    if (limpiarCon) reset({ codigo: '' })
  }, [limpiarCon, reset])

  return (
    <form
      onSubmit={handleSubmit(({ codigo }) => onBuscar(codigo))}
      noValidate
      className="flex flex-col gap-3 sm:flex-row sm:items-start"
    >
      <div className="flex-1">
        <Campo
          etiqueta={etiqueta}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          className="font-mono uppercase"
          error={errors.codigo?.message}
          {...register('codigo')}
        />
      </div>
      <Boton type="submit" className="sm:mt-7">
        {textoBoton}
      </Boton>
    </form>
  )
}
