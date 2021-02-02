
import bcrypt from 'bcrypt'

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function matchPassword(enteredPassword: string, savedPassword: string) {
  return bcrypt.compare(enteredPassword, savedPassword)
}
