const http = require('http')

const PORT = process.env.PORT || 3000

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Todo app</title>
  </head>
  <body>
    <h1>Todo app</h1>
    <p>Hello from Kubernetes!</p>
  </body>
</html>`

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
    return
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
