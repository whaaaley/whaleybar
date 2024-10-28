// Environment configuration
export const env = {
  ENV: Deno.env.get('ENV'),
  PORT: Deno.env.get('PORT'),
}
