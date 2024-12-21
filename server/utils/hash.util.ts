const bytes = crypto.getRandomValues(new Uint8Array(16))
const salt = Array.from(bytes)
  .map((b) => b.toString(16).padStart(2, '0'))
  .join('')

export const createSaltedHash = async (str: string): Promise<string> => {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + str))
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16)
}
