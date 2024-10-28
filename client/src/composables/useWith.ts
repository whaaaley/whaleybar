export type Fn<T> = (ctx: T) => Promise<unknown>
export type Middleware<T> = (ctx: T) => Promise<unknown>

export interface MiddlewareCtx<T> {
  fn: Fn<T>
  beforeQueue: Middleware<T>[]
  afterQueue: Middleware<T>[]
}

export const useWith = <T>(params: MiddlewareCtx<T>) => {
  const data = ref<unknown | null>(null)
  const error = ref<unknown | null>(null)
  const loading = ref<boolean>(false)

  const useBefore = (middleware: Middleware<T>) => {
    params.beforeQueue.push(middleware)
  }

  const useAfter = (middleware: Middleware<T>) => {
    params.afterQueue.push(middleware)
  }

  const execute = async (ctx: T) => {
    data.value = null
    error.value = null
    loading.value = true

    try {
      for (const middleware of params.beforeQueue) {
        await middleware(ctx)
      }

      data.value = await params.fn(ctx)

      for (const middleware of params.afterQueue) {
        await middleware(ctx)
      }

      return data.value
    }
    catch (err) {
      error.value = err
      throw err
    }
    finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    useBefore,
    useAfter,
    execute,
  }
}
