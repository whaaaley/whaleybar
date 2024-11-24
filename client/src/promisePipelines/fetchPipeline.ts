import { httpMiddleware, marshalMiddleware, zodMiddleware } from './middleware/index'
import { useWithGet, useWithPost } from '~/composables/useWithFetch'

export const withGet = useWithGet()
export const withPost = useWithPost()

withGet.useBefore(marshalMiddleware)
withPost.useBefore(marshalMiddleware)

withGet.useAfter(httpMiddleware)
withPost.useAfter(httpMiddleware)

withGet.useAfter(zodMiddleware)
withPost.useAfter(zodMiddleware)
