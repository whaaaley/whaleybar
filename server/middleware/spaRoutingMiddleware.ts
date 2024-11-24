import { Context, send } from '@oak/oak'
import { join } from '@std/path'

// Catch-all middleware for SPA routing
// This ensures that all non-matched routes serve the main index.html
// Crucial for client-side routing in Single Page Applications
export const spaRoutingMiddleware = async (ctx: Context) => {
  await send(ctx, './index.html', {
    root: join(Deno.cwd(), './dist'),
  })
}
