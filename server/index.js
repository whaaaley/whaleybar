import { Application } from '@oak/oak'
import { getLogger } from '@logtape/logtape'
import routes from './routes/index.ts'
import { corsMiddleware } from './middleware/corsMiddleware.ts'
// import { errorHandlingMiddleware } from './middleware/errorHandlingMiddleware.js'
// import { spaRoutingMiddleware } from './middleware/spaRoutingMiddleware.js'
// import { staticFileMiddleware } from './middleware/staticFileMiddleware.js'
import { env } from './config/env.js'
import './logging.js'

const app = new Application()
const logger = getLogger(['app'])

app.use(corsMiddleware) // CORS first
// app.use(staticFileMiddleware) // Static files before API

app.use(routes.api.routes())
app.use(routes.api.allowedMethods())

// app.use(spaRoutingMiddleware)
// app.use(errorHandlingMiddleware) // Error handling last

logger.info('Server is running on port {port}', { port: env.PORT })

app.listen({
  port: parseInt(env.PORT),
})
