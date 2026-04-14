import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import { getDb } from './_db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Endast POST tillåtet' })
  }
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' })
  }
  const db = await getDb()
  const [users] = await db.query('SELECT * FROM users WHERE username = ?', [
    username,
  ])
  if (!Array.isArray(users) || users.length === 0) {
    return res
      .status(401)
      .json({ error: 'Felaktigt användarnamn eller lösenord' })
  }
  const user = users[0]
  if (!user.password) {
    return res
      .status(500)
      .json({ error: 'Fel på användardata (lösenord saknas)' })
  }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res
      .status(401)
      .json({ error: 'Felaktigt användarnamn eller lösenord' })
  }
  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
  return res.status(200).json({ token })
}
