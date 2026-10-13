const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const PING_PONG_URL = process.env.PING_PONG_URL || 'http://ping-pong-svc:2345/pings'
const logPath = path.join('/', 'usr', 'src', 'app', 'files', 'log.txt')

const readLastLine = () => {
  try {
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n')
    return lines[lines.length - 1]
  } catch {
    return 'No logs yet'
  }
}

// Ρωτάει την ping-pong μέσω HTTP
const getPings = async () => {
  const response = await fetch(PING_PONG_URL)
  if (!response.ok) throw new Error(`Ping-pong responded ${response.status}`)
  const data = await response.json()
  return data.pings
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    let pings
    try {
      pings = await getPings()
    } catch (err) {
      console.error(`Could not reach ping-pong: ${err.message}`)
      pings = 'unavailable'
    }
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`${readLastLine()}.\nPing / Pongs: ${pings}\n`)
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}, ping-pong at ${PING_PONG_URL}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
