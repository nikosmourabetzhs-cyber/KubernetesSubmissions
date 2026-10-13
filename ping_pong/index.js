const http = require('http')

const PORT = process.env.PORT || 3000

// Ο μετρητής ζει στη μνήμη
let counter = 0

const server = http.createServer((req, res) => {
  // Για τον browser: απαντάει pong και αυξάνει τον μετρητή
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`pong ${counter}\n`)
    counter++
    return
  }

  // Για το log-output: λέει πόσα pongs έχουν γίνει, ΧΩΡΙΣ να αυξήσει τον μετρητή
  if (req.method === 'GET' && req.url === '/pings') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ pings: counter }))
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
