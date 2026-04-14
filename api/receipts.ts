import { VercelRequest, VercelResponse } from '@vercel/node'

import mysql from 'mysql2/promise'

import jwt from 'jsonwebtoken'

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' })
  }
  // Kontrollera JWT-token
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen eller ogiltig token' })
  }
  let userId
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET) as any
    userId = decoded.userId
  } catch {
    return res.status(401).json({ error: 'Ogiltig token' })
  }
  try {
    const db = await await mysql.createConnection(dbConfig)
    const [rows] = await db.execute(
      'SELECT id, name, created_at FROM receipts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    return res.status(200).json({ receipts: rows })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
