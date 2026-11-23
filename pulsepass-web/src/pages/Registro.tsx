import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoOjo, IconoOjoTachado } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import MedidorFortaleza from '../funcionalidades/usuarios/componentes/MedidorFortaleza'
import { useRegistrarUsuario } from '../funcionalidades/usuarios/hooks'
import { RegistroSchema, hoyIso, type RegistroForm } from '../funcionalidades/usuarios/tipos'
import Pagina from '../layouts/Pagina'
import { mensajeDeError } from '../lib/errores'
import { ApiError } from '../lib/http'
import { RUTAS, type EstadoLogin } from '../lib/rutas'

const CAMPOS = ['username', 'email', 'firstName', 'lastName', 'birthDate', 'password'] as const
type NombreCampo = (typeof CAMPOS)[number]
const esCampo = (clave: string): clave is NombreCampo =>
  (CAMPOS as readonly string[]).includes(clave)

/** Registro — /registro (§9.9). No hay selección de rol: el backend asigna USER. */
export default function Registro() {
  const navigate = useNavigate()
  const registrar = useRegistrarUsuario()
  const [verPassword, setVerPassword] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegistroForm>({
    resolver: zodResolver(RegistroSchema),
    defaultValues: {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      birthDate: '',
      password: '',
    },
  })

  const password = useWatch({ control, name: 'password' })

  const enviar = handleSubmit((datos) => {
    registrar.mutate(datos, {
      onSuccess: () => {
        const estado: EstadoLogin = { registrado: true }
        navigate(RUTAS.login, { state: estado })
      },
      onError: (error) => {
        if (error instanceof ApiError && error.status === 400) {
          const generales: string[] = []
          for (const [clave, mensaje] of Object.entries(error.details)) {
            // passwordValid es el @AssertTrue de la política de contraseña del backend.
            if (clave === 'passwordValid') setError('password', { message: mensaje })
            else if (esCampo(clave)) setError(clave, { message: mensaje })
            else generales.push(mensaje)
          }
          if (generales.length) setError('root.servidor', { message: generales.join(' ') })
          return
        }
        // 409: mensaje genérico, sin detalles internos (AC-FE-006).
        const mensaje =
          error instanceof ApiError && error.status === 409
            ? 'El usuario o correo ya está registrado.'
            : mensajeDeError(error)
        setError('root.servidor', { message: mensaje })
      },
    })
  })

  return (
    <Pagina className="flex justify-center">
      <title>Crea tu cuenta · PulsePass</title>
      <Tarjeta className="w-full max-w-xl space-y-6 p-8">
        <h1 className="text-center text-2xl font-bold">Crea tu cuenta</h1>
        <form onSubmit={enviar} noValidate className="space-y-5">
          <div aria-live="polite">
            {errors.root?.servidor?.message ? (
              <Aviso tono="error">{errors.root.servidor.message}</Aviso>
            ) : null}
          </div>
          <Campo
            etiqueta="Nombre de usuario"
            autoComplete="username"
            error={errors.username?.message}
            {...register('username')}
          />
          <Campo
            etiqueta="Correo electrónico"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Campo
              etiqueta="Nombres"
              autoComplete="given-name"
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Campo
              etiqueta="Apellidos"
              autoComplete="family-name"
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <Campo
            etiqueta="Fecha de nacimiento"
            type="date"
            max={hoyIso()}
            autoComplete="bday"
            error={errors.birthDate?.message}
            {...register('birthDate')}
          />
          <Campo
            etiqueta="Contraseña (mín. 12)"
            type={verPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={errors.password?.message}
            accesorio={
              <button
                type="button"
                onClick={() => setVerPassword((valor) => !valor)}
                aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={verPassword}
                className="inline-flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-marca-600 dark:hover:bg-slate-800"
              >
                {verPassword ? <IconoOjoTachado /> : <IconoOjo />}
              </button>
            }
            {...register('password')}
          />
          <MedidorFortaleza password={password} />
          <Boton type="submit" tamano="grande" className="w-full" cargando={registrar.isPending}>
            Crear cuenta
          </Boton>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={RUTAS.login}
            className="font-semibold text-marca-600 hover:underline dark:text-marca-500"
          >
            Inicia sesión
          </Link>
        </p>
      </Tarjeta>
    </Pagina>
  )
}
