export const authMiddleware = async (ctx, next) => {
  const token = localStorage.getItem('token')

  if (!token) {
    throw new Error('Unauthorized')
  }

  ctx.headers = {
    ...ctx.headers,
    Authorization: `Bearer ${token}`,
  }

  return next()
}
