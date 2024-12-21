import { Application } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import { env } from './env.ts'
import * as middleware from './src/middleware.ts'
import * as routes from './src/routes.ts'
import './src/logging.ts'

const app = new Application()
const logger = getLogger(['app'])

app.use(middleware.errorMiddleware)
app.use(middleware.loggerMiddleware)
app.use(middleware.rateLimitMiddleware())
app.use(middleware.corsMiddleware)

app.use(middleware.staticFileMiddleware)

app.use(routes.api.routes())
app.use(routes.api.allowedMethods())

// This middleware should be the last one to handle SPA routing in case the
// requested file does not exist
app.use(middleware.spaRoutingMiddleware)

const port = parseInt(env.PORT ?? '3000')

app.listen({ port })
logger.info('Server is running on port {port}', { port })
