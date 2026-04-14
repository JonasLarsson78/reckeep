import { VercelRequest, VercelResponse } from '@vercel/node'
import mysql from 'mysql2/promise'

const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET allowed' })
  }
  try {
    const conn = await mysql.createConnection(dbConfig)
    const [rows] = await conn.execute(
      'SELECT id, name, created_at FROM receipts ORDER BY created_at DESC'
    )
    await conn.end()
    return res.status(200).json({ receipts: rows })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
