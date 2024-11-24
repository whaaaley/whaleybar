import { ref } from 'vue'

export type Fn<T, R> = (ctx: T, runAfterQueue: (result: R) => void) => Promise<R>
export type Middleware<T> = (ctx: T) => Promise<void>

export type MiddlewareCtx<T, R> = {
  fn: Fn<T, R>
}

export type UseWithOptions = {
  shouldThrow?: boolean
}

export const useWith = <T, R>(params: MiddlewareCtx<T, R>) => {
  const data = ref<R | null>(null)
  const error = ref<unknown | null>(null)

  const beforeQueue: Middleware<T>[] = []
  const afterQueue: Middleware<R>[] = []

  const useBefore = (middleware: Middleware<T>) => {
    beforeQueue.push(middleware)
  }

  const useAfter = (middleware: Middleware<R>) => {
    afterQueue.push(middleware)
  }

  const runAfterQueue = async (result: R) => {
    for (const middleware of afterQueue) {
      await middleware(result)
    }
  }

  const execute = async (ctx: T, options: UseWithOptions = {}) => {
    const { shouldThrow = true } = options

    data.value = null
    error.value = null

    try {
      for (const middleware of beforeQueue) {
        await middleware(ctx)
      }

      const result = await params.fn(ctx, runAfterQueue)
      data.value = result

      await runAfterQueue(result)

      return data.value
    }
    catch (err) {
      error.value = err

      if (shouldThrow) {
        throw err
      }
    }
  }

  return {
    data,
    error,
    useBefore,
    useAfter,
    execute,
  }
}
