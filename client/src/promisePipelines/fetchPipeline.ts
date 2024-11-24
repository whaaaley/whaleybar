import * as middleware from './middleware/index'
import { useWithGet, useWithPost } from '~/composables/useWithFetch'

export const withGet = useWithGet()
export const withPost = useWithPost()

withGet.useBefore(middleware.devMiddleware)
withPost.useBefore(middleware.devMiddleware)

withGet.useBefore(middleware.marshalMiddleware)
withPost.useBefore(middleware.marshalMiddleware)

withGet.useAfter(middleware.httpMiddleware)
withPost.useAfter(middleware.httpMiddleware)

withGet.useAfter(middleware.zodMiddleware)
withPost.useAfter(middleware.zodMiddleware)
