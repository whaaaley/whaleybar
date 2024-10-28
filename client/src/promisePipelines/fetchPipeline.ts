// import { authMiddleware } from './middleware/authMiddleware.ts'
// import { zodMiddleware } from './middleware/zodMiddleware.ts'
import { useWithGet, useWithPost } from '~/composables/useWithFetch.ts'

export const withGet = useWithGet()
export const withPost = useWithPost()

// withGet.use(authMiddleware)
// withGet.use(zodMiddleware)

// withPost.use(authMiddleware)
// withPost.use(zodMiddleware)
