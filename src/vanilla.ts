import type { CreateStore, CreateStoreImpl, StoreApi } from './types/vanilla.ts'
export type {
  StoreApi,
  Mutate,
  StateCreator,
  State,
  PartialState,
  StateSelector,
  EqualityChecker,
  StateListener,
  StateSliceListener,
  Subscribe,
  SetState,
  GetState,
  Destroy,
  StoreMutators,
  StoreMutatorIdentifier,
} from './types/vanilla.ts'

const createStoreImpl: CreateStoreImpl = (createState) => {
  type TState = ReturnType<typeof createState>
  type Listener = (state: TState, prevState: TState) => void
  let state: TState
  const listeners: Set<Listener> = new Set()

  const setState: StoreApi<TState>['setState'] = (partial, replace) => {
    // TODO: Remove type assertion once https://github.com/microsoft/TypeScript/issues/37663 is resolved
    // https://github.com/microsoft/TypeScript/issues/37663#issuecomment-759728342
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: TState) => TState)(state)
        : partial
    if (!Object.is(nextState, state)) {
      const previousState = state
      state =
        replace ?? (typeof nextState !== 'object' || nextState === null)
          ? (nextState as TState)
          : Object.assign({}, state, nextState)
      listeners.forEach((listener) => listener(state, previousState))
    }
  }

  const getState: StoreApi<TState>['getState'] = () => state

  const getInitialState: StoreApi<TState>['getInitialState'] = () =>
    initialState

  const subscribe: StoreApi<TState>['subscribe'] = (listener) => {
    listeners.add(listener)
    // Unsubscribe
    return () => listeners.delete(listener)
  }

  const destroy: StoreApi<TState>['destroy'] = () => {
    if (import.meta.env?.MODE !== 'production') {
      console.warn(
        '[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.',
      )
    }
    listeners.clear()
  }

  const api = { setState, getState, getInitialState, subscribe, destroy }
  const initialState = (state = createState(setState, getState, api))
  return api as any
}

export const createStore = ((createState) =>
  createState ? createStoreImpl(createState) : createStoreImpl) as CreateStore

/**
 * @deprecated Use `import { createStore } from 'zustand/vanilla'`
 */
export default ((createState) => {
  if (import.meta.env?.MODE !== 'production') {
    console.warn(
      "[DEPRECATED] Default export is deprecated. Instead use import { createStore } from 'zustand/vanilla'.",
    )
  }
  return createStore(createState)
}) as CreateStore
