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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Only DELETE allowed' })
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
  const { id } = req.query
  if (!id) {
    return res.status(400).json({ error: 'Måste ange id' })
  }
  try {
    const db = await mysql.createConnection(dbConfig)
    // Ta bort endast om kvittot tillhör användaren
    const [result] = await db.execute(
      'DELETE FROM receipts WHERE id = ? AND user_id = ?',
      [id, userId]
    )
    if ((result as any).affectedRows === 0) {
      return res
        .status(404)
        .json({ error: 'Kvitto hittades inte eller saknar behörighet' })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
