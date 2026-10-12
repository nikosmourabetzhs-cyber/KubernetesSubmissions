const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const filePath = path.join('/', 'usr', 'src', 'app', 'files', 'log.txt')

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(filePath, 'utf8', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      if (err) {
        res.end('No logs yet\n')   // ο writer δεν έχει γράψει ακόμα
        return
      }
      res.end(data)
    })
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
