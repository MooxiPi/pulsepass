import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { configurarHttp } from '../../lib/http'
import { crearEnvoltura, crearQueryClientPrueba } from '../../test/utils'
import { useCancelarTicket, useComprarTicket, useUsarTicket } from './hooks'

/** QT-FE-008: invalidación de caché tras cada mutación (§14.2). */
describe('Invalidaciones de tickets', () => {
  it('useCancelarTicket invalida tickets del usuario, el ticket y los pagados del evento', async () => {
    configurarHttp({ obtenerToken: () => 'token-andrea', alNoAutorizado: () => {} })
    const queryClient = crearQueryClientPrueba()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useCancelarTicket(), {
      wrapper: crearEnvoltura(queryClient),
    })

    await act(() => result.current.mutateAsync('TCK-8F2A1C'))

    const claves = invalidar.mock.calls.map(([filtro]) => filtro?.queryKey)
    expect(claves).toEqual(
      expect.arrayContaining([
        ['tickets', 'usuario', 'andrea@pulsepass.test'],
        ['ticket', 'TCK-8F2A1C'],
        ['tickets', 'pagados', 'CMF-2026'],
      ]),
    )
  })

  it('useComprarTicket invalida los tickets del usuario y el evento', async () => {
    configurarHttp({ obtenerToken: () => 'token-andrea', alNoAutorizado: () => {} })
    const queryClient = crearQueryClientPrueba()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useComprarTicket(), {
      wrapper: crearEnvoltura(queryClient),
    })

    await act(() =>
      result.current.mutateAsync({
        userEmail: 'andrea@pulsepass.test',
        eventCode: 'CMF-2026',
        type: 'GENERAL',
      }),
    )
    const claves = invalidar.mock.calls.map(([filtro]) => filtro?.queryKey)
    expect(claves).toEqual(
      expect.arrayContaining([
        ['tickets', 'usuario', 'andrea@pulsepass.test'],
        ['evento', 'CMF-2026'],
      ]),
    )
  })

  it('useUsarTicket invalida el ticket y los pagados del evento', async () => {
    configurarHttp({ obtenerToken: () => 'token-staff', alNoAutorizado: () => {} })
    const queryClient = crearQueryClientPrueba()
    const invalidar = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useUsarTicket(), { wrapper: crearEnvoltura(queryClient) })

    await act(() => result.current.mutateAsync('TCK-91B07D'))
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const claves = invalidar.mock.calls.map(([filtro]) => filtro?.queryKey)
    expect(claves).toEqual(
      expect.arrayContaining([
        ['ticket', 'TCK-91B07D'],
        ['tickets', 'pagados', 'CMF-2026'],
      ]),
    )
  })
})
