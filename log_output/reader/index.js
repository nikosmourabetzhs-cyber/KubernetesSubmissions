const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const directory = path.join('/', 'usr', 'src', 'app', 'files')
const logPath = path.join(directory, 'log.txt')
const pingPongPath = path.join(directory, 'pingpong.txt')

const readLastLine = () => {
  try {
    const lines = fs.readFileSync(logPath, 'utf8').trim().split('\n')
    return lines[lines.length - 1]
  } catch {
    return 'No logs yet'
  }
}

const readPingPongs = () => {
  try {
    return parseInt(fs.readFileSync(pingPongPath, 'utf8'), 10) || 0
  } catch {
    return 0
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`${readLastLine()}.\nPing / Pongs: ${readPingPongs()}\n`)
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
