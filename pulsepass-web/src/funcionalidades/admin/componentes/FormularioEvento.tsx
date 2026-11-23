import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import AreaTexto from '../../../componentes/AreaTexto'
import Aviso from '../../../componentes/Aviso'
import Boton from '../../../componentes/Boton'
import Campo from '../../../componentes/Campo'
import EnlaceBoton from '../../../componentes/EnlaceBoton'
import Selector from '../../../componentes/Selector'
import { mensajeDeError } from '../../../lib/errores'
import { ApiError } from '../../../lib/http'
import { RUTAS } from '../../../lib/rutas'
import {
  CrearEventoFormSchema,
  ETIQUETAS_CATEGORIA,
  EventCategorySchema,
  LONGITUD_MAX_DESCRIPCION,
  type CrearEventoForm,
  type CrearEventoValidado,
} from '../../eventos/tipos'
import type { Sede } from '../../sedes/tipos'

const CAMPOS = [
  'eventCode',
  'name',
  'description',
  'category',
  'eventDate',
  'minimumAge',
  'venueCode',
] as const
type NombreCampo = (typeof CAMPOS)[number]
const esCampo = (clave: string): clave is NombreCampo =>
  (CAMPOS as readonly string[]).includes(clave)

interface PropsFormularioEvento {
  sedes: Sede[]
  cargandoSedes: boolean
  enviando: boolean
  onEnviar: (datos: CrearEventoValidado) => Promise<unknown>
}

/** Formulario de creación (§9.17): RHF + zod; 400 con details se asigna a los campos. */
export default function FormularioEvento({
  sedes,
  cargandoSedes,
  enviando,
  onEnviar,
}: PropsFormularioEvento) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<CrearEventoForm, unknown, CrearEventoValidado>({
    resolver: zodResolver(CrearEventoFormSchema),
    defaultValues: {
      eventCode: '',
      name: '',
      description: '',
      category: '',
      eventDate: '',
      minimumAge: 0,
      venueCode: '',
    },
  })

  const descripcion = useWatch({ control, name: 'description' })
  const longitudDescripcion = descripcion?.length ?? 0

  const enviar = handleSubmit(async (datos) => {
    try {
      await onEnviar(datos)
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const generales: string[] = []
        for (const [clave, mensaje] of Object.entries(error.details)) {
          if (esCampo(clave)) setError(clave, { message: mensaje })
          else generales.push(mensaje)
        }
        setError('root.servidor', {
          message: generales.length ? generales.join(' ') : mensajeDeError(error),
        })
        return
      }
      setError('root.servidor', { message: mensajeDeError(error) })
    }
  })

  return (
    <form onSubmit={enviar} noValidate className="space-y-5">
      {errors.root?.servidor?.message ? (
        <Aviso tono="error">{errors.root.servidor.message}</Aviso>
      ) : null}
      <Campo
        etiqueta="Código del evento"
        placeholder="CMF-2026"
        className="font-mono"
        error={errors.eventCode?.message}
        {...register('eventCode')}
      />
      <Campo etiqueta="Nombre" error={errors.name?.message} {...register('name')} />
      <AreaTexto
        etiqueta="Descripción"
        rows={4}
        maxLength={LONGITUD_MAX_DESCRIPCION}
        ayuda={`${longitudDescripcion}/${LONGITUD_MAX_DESCRIPCION}`}
        error={errors.description?.message}
        {...register('description')}
      />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Selector etiqueta="Categoría" error={errors.category?.message} {...register('category')}>
          <option value="">Selecciona…</option>
          {EventCategorySchema.options.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria} · {ETIQUETAS_CATEGORIA[categoria]}
            </option>
          ))}
        </Selector>
        <Campo
          etiqueta="Edad mínima"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          error={errors.minimumAge?.message}
          {...register('minimumAge', { valueAsNumber: true })}
        />
      </div>
      <Campo
        etiqueta="Fecha y hora"
        type="datetime-local"
        error={errors.eventDate?.message}
        {...register('eventDate')}
      />
      <Selector
        etiqueta="Sede"
        disabled={cargandoSedes}
        error={errors.venueCode?.message}
        {...register('venueCode')}
      >
        <option value="">{cargandoSedes ? 'Cargando sedes…' : 'Elige una sede…'}</option>
        {sedes.map((sede) => (
          <option key={sede.code} value={sede.code}>
            {sede.name} ({sede.code})
          </option>
        ))}
      </Selector>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <EnlaceBoton variante="secundario" to={RUTAS.adminEventos}>
          Cancelar
        </EnlaceBoton>
        <Boton type="submit" cargando={enviando}>
          Crear evento
        </Boton>
      </div>
    </form>
  )
}
