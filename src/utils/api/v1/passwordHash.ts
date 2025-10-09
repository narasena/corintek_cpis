import bcrypt from 'bcrypt'

const saltRounds = 10

export function hashPassword(password: string) {
  const hashedPassword = bcrypt.hashSync(password, saltRounds)
  return hashedPassword
}

export function comparePassword(password: string, hashedPassword: string) {
  const isMatch = bcrypt.compareSync(password, hashedPassword)
  return isMatch
}