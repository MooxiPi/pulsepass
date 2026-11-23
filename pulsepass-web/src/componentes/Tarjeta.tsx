import clsx from 'clsx'
import type { ComponentProps } from 'react'

/** Superficie visual: bg-white + shadow-sm / dark:bg-slate-900 (§9.1). */
export default function Tarjeta({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
      {...props}
    />
  )
}
