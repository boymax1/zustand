// import { useDebugValue } from 'react'
// import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
// Those don't work in ESM, because React libs are CJS only.
// See: https://github.com/pmndrs/valtio/issues/452
// The following is a workaround until ESM is supported.
// eslint-disable-next-line import/extensions
import ReactExports from 'react'
// eslint-disable-next-line import/extensions
import useSyncExternalStoreExports from 'use-sync-external-store/shim/with-selector'
import type { Create, TUseStore } from './types/react.ts'
import type { StateCreator } from './types/vanilla.ts'
import { createStore } from './vanilla.ts'

export type { UseBoundStore } from './types/react.ts'

const { useDebugValue } = ReactExports
const { useSyncExternalStoreWithSelector } = useSyncExternalStoreExports

let didWarnAboutEqualityFn = false

const identity = (arg: unknown) => arg

export function useStore<TState, StateSlice>(
  ...args: TUseStore<TState, StateSlice>
) {
  const [api, selector = identity as (arg: TState) => StateSlice, equalityFn] =
    args
  if (
    import.meta.env?.MODE !== 'production' &&
    equalityFn &&
    !didWarnAboutEqualityFn
  ) {
    console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937",
    )
    didWarnAboutEqualityFn = true
  }
  const slice = useSyncExternalStoreWithSelector(
    api.subscribe,
    api.getState,
    api.getServerState || api.getInitialState,
    selector,
    equalityFn,
  )
  useDebugValue(slice)
  return slice
}

const createImpl = <T>(createState: StateCreator<T, [], []>) => {
  if (
    import.meta.env?.MODE !== 'production' &&
    typeof createState !== 'function'
  ) {
    console.warn(
      "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`.",
    )
  }
  const api =
    typeof createState === 'function' ? createStore(createState) : createState

  const useBoundStore: any = (selector?: any, equalityFn?: any) =>
    useStore(api, selector, equalityFn)

  Object.assign(useBoundStore, api)

  return useBoundStore
}

export const create = (<T>(createState: StateCreator<T, [], []> | undefined) =>
  createState ? createImpl(createState) : createImpl) as Create

/**
 * @deprecated Use `import { create } from 'zustand'`
 */
export default ((createState: any) => {
  if (import.meta.env?.MODE !== 'production') {
    console.warn(
      "[DEPRECATED] Default export is deprecated. Instead use `import { create } from 'zustand'`.",
    )
  }
  return create(createState)
}) as Create
