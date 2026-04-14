import type { VercelRequest, VercelResponse } from '@vercel/node'
import bcrypt from 'bcryptjs'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Endast POST tillåtet' })
  }
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ error: 'Användarnamn och lösenord krävs' })
  }
  const db = await mysql.createConnection(dbConfig)
  const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [
    username,
  ])
  if (Array.isArray(existing) && existing.length > 0) {
    return res.status(409).json({ error: 'Användarnamnet är upptaget' })
  }
  const hash = await bcrypt.hash(password, 10)
  await db.query('INSERT INTO users (username, password) VALUES (?, ?)', [
    username,
    hash,
  ])
  return res.status(201).json({ success: true })
}
