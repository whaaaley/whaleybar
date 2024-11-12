// import { authMiddleware } from './middleware/authMiddleware'
import { serializationMiddleware, zodMiddleware } from './middleware/index'
import { useWithGet, useWithPost } from '~/composables/useWithFetch'

export const withGet = useWithGet()
export const withPost = useWithPost()

// withGet.useBefore(authMiddleware)
// withPost.useBefore(authMiddleware)

withGet.useBefore(serializationMiddleware)
withPost.useBefore(serializationMiddleware)

withGet.useAfter(zodMiddleware)
withPost.useAfter(zodMiddleware)
