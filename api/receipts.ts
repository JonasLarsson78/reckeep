import { VercelRequest, VercelResponse } from '@vercel/node'
import { getDb } from './_db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' })
  }
  // Kontrollera JWT-token
  const auth = req.headers.authorization
  console.log('receipts: Authorization header', auth)
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
    const db = await getDb()
    const [rows] = await db.execute(
      'SELECT id, name, created_at FROM receipts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    )
    return res.status(200).json({ receipts: rows })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
