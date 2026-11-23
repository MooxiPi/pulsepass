import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import Aviso from '../componentes/Aviso'
import Boton from '../componentes/Boton'
import Campo from '../componentes/Campo'
import { IconoMusica, IconoOjo, IconoOjoTachado } from '../componentes/Iconos'
import Tarjeta from '../componentes/Tarjeta'
import { useLogin } from '../funcionalidades/auth/hooks'
import { LoginSchema, type LoginForm } from '../funcionalidades/auth/tipos'
import Pagina from '../layouts/Pagina'
import { MENSAJES, mensajeDeError } from '../lib/errores'
import { ApiError } from '../lib/http'
import { RUTAS, leerEstadoLogin } from '../lib/rutas'

function mensajeLogin(error: unknown): string {
  if (error instanceof ApiError) {
    // 401: mensaje genérico, nunca distingue usuario inexistente de contraseña errónea.
    if (error.status === 401) return MENSAJES.credenciales
    if (error.status === 400) return MENSAJES.validacion
    if (error.status >= 500 || error.status === 0) return 'Inténtalo más tarde.'
  }
  return mensajeDeError(error)
}

/** Login — /login (§9.8). */
export default function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const estado = leerEstadoLogin(location.state)
  const login = useLogin()
  const [verPassword, setVerPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { identifier: '', password: '' },
  })

  const enviar = handleSubmit((datos) => {
    login.mutate(datos, {
      onSuccess: () => navigate(estado.desde ?? RUTAS.inicio, { replace: true }),
    })
  })

  return (
    <Pagina className="flex justify-center">
      <title>Inicia sesión · PulsePass</title>
      <Tarjeta className="w-full max-w-md space-y-6 p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-10 items-center justify-center rounded-xl bg-marca-600 text-white">
            <IconoMusica />
          </span>
          <p className="font-titulo text-lg font-bold">PulsePass</p>
          <h1 className="text-2xl font-bold">Inicia sesión</h1>
        </div>
        {estado.motivo === 'expirada' ? (
          <Aviso tono="advertencia">Tu sesión expiró. Inicia sesión de nuevo.</Aviso>
        ) : null}
        {estado.registrado ? <Aviso tono="exito">Cuenta creada, inicia sesión.</Aviso> : null}
        <form onSubmit={enviar} noValidate className="space-y-5">
          <Campo
            etiqueta="Usuario o correo"
            autoComplete="username"
            autoFocus
            error={errors.identifier?.message}
            {...register('identifier')}
          />
          <Campo
            etiqueta="Contraseña"
            type={verPassword ? 'text' : 'password'}
            autoComplete="current-password"
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
          <div aria-live="polite">
            {login.isError ? <Aviso tono="error">{mensajeLogin(login.error)}</Aviso> : null}
          </div>
          <Boton type="submit" tamano="grande" className="w-full" cargando={login.isPending}>
            Ingresar
          </Boton>
        </form>
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          ¿No tienes cuenta?{' '}
          <Link
            to={RUTAS.registro}
            className="font-semibold text-marca-600 hover:underline dark:text-marca-500"
          >
            Regístrate
          </Link>
        </p>
      </Tarjeta>
    </Pagina>
  )
}
