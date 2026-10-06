const http = require('http')
const { randomUUID } = require('crypto')

const PORT = process.env.PORT || 3000

// Δημιουργείται ΜΙΑ φορά στο startup και μένει στη μνήμη
const randomString = randomUUID()

const getStatus = () => `${new Date().toISOString()}: ${randomString}`

// Όπως πριν: γράφει στα logs κάθε 5 δευτερόλεπτα
console.log(getStatus())
setInterval(() => console.log(getStatus()), 5000)

// Νέο: endpoint που επιστρέφει την τρέχουσα κατάσταση
const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(getStatus() + '\n')
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
