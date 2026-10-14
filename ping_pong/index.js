const http = require('http')
const { Pool } = require('pg')

const PORT = process.env.PORT
if (PORT === undefined) {
  console.error('Missing env variable: PORT')
  process.exit(1)
}

// Διαβάζει αυτόματα PGHOST, PGUSER, PGPASSWORD, PGDATABASE
const pool = new Pool()

// Περιμένει τη βάση και φτιάχνει τον πίνακα αν δεν υπάρχει
const initDb = async () => {
  for (let attempt = 1; ; attempt++) {
    try {
      await pool.query('CREATE TABLE IF NOT EXISTS counter (id INT PRIMARY KEY, value INT NOT NULL)')
      await pool.query('INSERT INTO counter (id, value) VALUES (1, 0) ON CONFLICT (id) DO NOTHING')
      console.log('Database ready')
      return
    } catch (err) {
      console.log(`Database not ready (attempt ${attempt}): ${err.message}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/pingpong') {
      const result = await pool.query('UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value')
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end(`pong ${result.rows[0].value - 1}\n`)
      return
    }
    if (req.method === 'GET' && req.url === '/pings') {
      const result = await pool.query('SELECT value FROM counter WHERE id = 1')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ pings: result.rows[0].value }))
      return
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found\n')
  } catch (err) {
    console.error(err.message)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Database error\n')
  }
})

initDb().then(() => {
  server.listen(PORT, () => console.log(`Server started in port ${PORT}`))
})

process.on('SIGTERM', () => server.close(() => pool.end().then(() => process.exit(0))))
