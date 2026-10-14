const http = require('http')

const PORT = process.env.PORT
if (process.env.PORT === undefined) { console.error('Missing env variable: PORT'); process.exit(1) }

const todos = ['Learn JavaScript', 'Learn React', 'Build a project']

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/todos') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(todos))
    return
  }

  if (req.method === 'POST' && req.url === '/todos') {
    let body = ''
    req.on('data', (chunk) => { body += chunk })
    req.on('end', () => {
      const todo = (new URLSearchParams(body).get('todo') || '').trim()
      if (todo && todo.length <= 140) {
        todos.push(todo)
        console.log(`Added todo: ${todo}`)
      }
      res.writeHead(302, { Location: '/' })
      res.end()
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => console.log(`Server started in port ${PORT}`))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
