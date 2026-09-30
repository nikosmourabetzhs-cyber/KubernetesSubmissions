const http = require('http')

// Παίρνει τη θύρα από τη μεταβλητή PORT. Αν δεν έχει οριστεί, χρησιμοποιεί 3000
const PORT = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Todo app\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
