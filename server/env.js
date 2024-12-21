const ENV = Deno.env.get('ENV')

export const env = {
  ENV,
  DEV: ENV === 'development',
  PROD: ENV === 'production',
  PORT: Deno.env.get('PORT'),
}
