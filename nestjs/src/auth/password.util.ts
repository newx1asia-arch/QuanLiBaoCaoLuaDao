import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCb) as (password: string, salt: Buffer, keylen: number) => Promise<Buffer>
const KEY_LEN = 64

// Định dạng lưu trong DB: scrypt$<salt base64>$<hash base64>
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const hash = await scrypt(password, salt, KEY_LEN)
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, salt, hash] = String(stored).split('$')
  if (alg !== 'scrypt' || !salt || !hash) return false
  const expected = Buffer.from(hash, 'base64')
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length)
  return actual.length === expected.length && timingSafeEqual(actual, expected)
}
