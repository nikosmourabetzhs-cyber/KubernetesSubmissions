const http = require('http')
const fs = require('fs')

const PORT = process.env.PORT || 3000
const PING_PONG_URL = process.env.PING_PONG_URL || 'http://ping-pong-svc:2345/pings'
const MESSAGE = process.env.MESSAGE || ''
const logPath = '/usr/src/app/files/log.txt'
const infoPath = '/usr/src/app/config/information.txt'

const readFile = (file, fallback) => {
  try {
    return fs.readFileSync(file, 'utf8').trim()
  } catch {
    return fallback
  }
}

const readLastLine = () => {
  const lines = readFile(logPath, 'No logs yet').split('\n')
  return lines[lines.length - 1]
}

const getPings = async () => {
  const response = await fetch(PING_PONG_URL)
  if (!response.ok) throw new Error(`Ping-pong responded ${response.status}`)
  return (await response.json()).pings
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
    res.end(
      `file content: ${readFile(infoPath, 'no file')}\n` +
      `env variable: MESSAGE=${MESSAGE}\n` +
      `${readLastLine()}.\n` +
      `Ping / Pongs: ${pings}\n`
    )
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => console.log(`Server started in port ${PORT}`))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
