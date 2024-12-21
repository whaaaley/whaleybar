import { Context, HttpError, Next, Status } from '@oak/oak'
import { env } from '../env.js'
import { z } from 'zod'

type ErrorType = HttpError | Error

const formatStackTrace = (stack?: string) => {
  if (!stack || env.ENV !== 'development') {
    return // Hide stack trace in production
  }

  return stack
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('at'))
}

const formatZodError = (err: z.ZodError) => {
  const stack = formatStackTrace(err.stack)

  return {
    errors: err.errors,
    ...(stack && { stack }),
  }
}

const formatError = (error: ErrorType, isDev: boolean) => {
  const status = 'status' in error ? error.status : Status.InternalServerError
  const stack = formatStackTrace(error.stack)

  return {
    errors: [{
      message: status >= 500 && !isDev ? 'Internal server error' : error.message,
    }],
    ...(stack && { stack }),
  }
}

export const errorMiddleware = async (ctx: Context, next: Next) => {
  try {
    await next()
  } catch (err: unknown) {
    const isDev = env.ENV === 'development'

    if (err instanceof z.ZodError) {
      // ctx.response.status = Status.BadRequest
      // ctx.response.body = formatZodError(err)
      // return

      return new Response(JSON.stringify(formatZodError(err)), {
        status: Status.BadRequest,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const error = err as ErrorType

    // ctx.response.status = 'status' in error ? error.status : Status.InternalServerError
    // ctx.response.body = formatError(error, isDev)

    return new Response(JSON.stringify(formatError(error, isDev)), {
      status: 'status' in error ? error.status : Status.InternalServerError,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  }
}
