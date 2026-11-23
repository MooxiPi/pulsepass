import type { ReactNode } from 'react'
import type { TonoBadge } from '../../componentes/Badge'
import {
  IconoCultura,
  IconoDeporte,
  IconoEducacion,
  IconoEntretenimiento,
  IconoMusica,
  IconoTecnologia,
} from '../../componentes/Iconos'
import type { EventCategory, EventStatus } from './tipos'

interface EstiloCategoria {
  fondo: string
  texto: string
  icono: ReactNode
}

/** Panel de color por categoría (DES-02): mapa tipado con clases completas. */
export const ESTILO_CATEGORIA: Record<EventCategory, EstiloCategoria> = {
  MUSIC: {
    fondo: 'bg-indigo-100 dark:bg-indigo-950',
    texto: 'text-indigo-700 dark:text-indigo-300',
    icono: <IconoMusica className="size-12" />,
  },
  TECHNOLOGY: {
    fondo: 'bg-sky-100 dark:bg-sky-950',
    texto: 'text-sky-700 dark:text-sky-300',
    icono: <IconoTecnologia className="size-12" />,
  },
  SPORTS: {
    fondo: 'bg-emerald-100 dark:bg-emerald-950',
    texto: 'text-emerald-700 dark:text-emerald-300',
    icono: <IconoDeporte className="size-12" />,
  },
  CULTURE: {
    fondo: 'bg-rose-100 dark:bg-rose-950',
    texto: 'text-rose-700 dark:text-rose-300',
    icono: <IconoCultura className="size-12" />,
  },
  EDUCATION: {
    fondo: 'bg-amber-100 dark:bg-amber-950',
    texto: 'text-amber-700 dark:text-amber-300',
    icono: <IconoEducacion className="size-12" />,
  },
  ENTERTAINMENT: {
    fondo: 'bg-violet-100 dark:bg-violet-950',
    texto: 'text-violet-700 dark:text-violet-300',
    icono: <IconoEntretenimiento className="size-12" />,
  },
}

/** Tono de badge por EventStatus (§9.1). */
export const TONO_ESTADO_EVENTO: Record<EventStatus, TonoBadge> = {
  DRAFT: 'gris',
  PUBLISHED: 'verde',
  SOLD_OUT: 'ambar',
  CANCELLED: 'rojo',
  FINISHED: 'grisOscuro',
}
