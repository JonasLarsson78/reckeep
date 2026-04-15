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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Ingen eller ogiltig token' })
  }
  let userId: number
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET) as any
    userId = decoded.userId
  } catch {
    return res.status(401).json({ error: 'Ogiltig token' })
  }

  const { imageBase64, name } = req.body
  if (!imageBase64 || !name) {
    return res.status(400).json({ error: 'Missing imageBase64 or name' })
  }

  try {
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(
      'INSERT INTO receipts (user_id, name, image_blob, created_at) VALUES (?, ?, ?, NOW())',
      [userId, name, Buffer.from(imageBase64, 'base64')]
    )
    await conn.end()
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
