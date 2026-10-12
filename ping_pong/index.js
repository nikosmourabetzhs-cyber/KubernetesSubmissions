const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'pingpong.txt')

fs.mkdirSync(directory, { recursive: true })

// Ξεκινάει από την τιμή που υπάρχει ήδη στο αρχείο (αν υπάρχει)
const readCounter = () => {
  try {
    return parseInt(fs.readFileSync(filePath, 'utf8'), 10) || 0
  } catch {
    return 0
  }
}

let counter = readCounter()

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/pingpong') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end(`pong ${counter}\n`)
    counter++
    fs.writeFileSync(filePath, String(counter))   // πλήθος αιτημάτων μέχρι τώρα
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}, counter at ${counter}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
