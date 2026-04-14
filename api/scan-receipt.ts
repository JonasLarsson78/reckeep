import { VercelRequest, VercelResponse } from '@vercel/node'
import mysql from 'mysql2/promise'

// OBS! Lägg in dina egna miljövariabler i Vercel för DB-anslutning
const dbConfig = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' })
  }

  const { imageBase64 } = req.body
  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing imageBase64' })
  }

  // Spara som blob i MySQL
  try {
    const conn = await mysql.createConnection(dbConfig)
    await conn.execute(
      'INSERT INTO receipts (image_blob, created_at) VALUES (?, NOW())',
      [Buffer.from(imageBase64, 'base64')]
    )
    await conn.end()
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'DB error', details: err })
  }
}
