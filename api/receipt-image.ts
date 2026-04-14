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
  const id = req.query.id
  if (!id) return res.status(400).json({ error: 'Missing id' })
  try {
    const conn = await mysql.createConnection(dbConfig)
    const [rows] = await conn.execute(
      'SELECT image_blob FROM receipts WHERE id = ?',
      [id]
    )
    await conn.end()
    const resultRows = rows as mysql.RowDataPacket[]
    if (!Array.isArray(resultRows) || resultRows.length === 0)
      return res.status(404).json({ error: 'Not found' })
    const imageBlob = resultRows[0].image_blob
    const base64 = Buffer.from(imageBlob).toString('base64')
    res.setHeader('Content-Type', 'application/json')
    return res.status(200).json({ imageBase64: base64 })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
