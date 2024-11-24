import { Application } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import * as routes from './routes/index.ts'
import * as middleware from './middleware/index.ts'
import { env } from './config/env.js'
import './logging.ts'

const app = new Application()
const logger = getLogger(['app'])

app.use(middleware.errorMiddleware)
app.use(middleware.loggerMiddleware)
app.use(middleware.corsMiddleware)

app.use(routes.api.routes())
app.use(routes.api.allowedMethods())

const port = parseInt(env.PORT ?? '3000')

app.listen({ port })
logger.info('Server is running on port {port}', { port })
