const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT
const TODO_BACKEND_URL = process.env.TODO_BACKEND_URL
const IMAGE_URL = process.env.IMAGE_URL
const MAX_AGE_MS = parseInt(process.env.IMAGE_MAX_AGE_SECONDS, 10) * 1000

const directory = process.env.IMAGE_DIR
for (const name of ['PORT', 'TODO_BACKEND_URL', 'IMAGE_URL', 'IMAGE_MAX_AGE_SECONDS', 'IMAGE_DIR']) { if (process.env[name] === undefined) { console.error('Missing env variable: ' + name); process.exit(1) } }
const imagePath = path.join(directory, 'image.jpg')
fs.mkdirSync(directory, { recursive: true })

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Ρωτάει το todo-backend μέσω HTTP
const getTodos = async () => {
  const response = await fetch(TODO_BACKEND_URL)
  if (!response.ok) throw new Error(`Backend responded ${response.status}`)
  return response.json()
}

const imageAge = () => {
  try {
    return Date.now() - fs.statSync(imagePath).mtimeMs
  } catch {
    return null
  }
}

let downloading = null
const downloadImage = () => {
  if (downloading) return downloading
  downloading = (async () => {
    console.log('Downloading new image...')
    const response = await fetch(IMAGE_URL)
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(imagePath + '.tmp', buffer)
    fs.renameSync(imagePath + '.tmp', imagePath)
    console.log('New image saved')
  })().finally(() => {
    downloading = null
  })
  return downloading
}

const ensureImage = async () => {
  const age = imageAge()
  if (age === null) {
    await downloadImage()
  } else if (age > MAX_AGE_MS) {
    downloadImage().catch((err) => console.error(err.message))
  }
}

const renderPage = (todos) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The project App</title>
    <style>
      body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
      img { width: 100%; height: auto; }
      form { display: flex; gap: 0.5rem; margin-top: 1.5rem; }
      input { flex: 1; padding: 0.5rem; font-size: 1rem; }
      button { padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; }
      footer { margin-top: 2rem; color: #666; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>The project App</h1>
    <img src="/image" alt="Random image from Lorem Picsum">

    <form action="/todos" method="POST">
      <input type="text" name="todo" maxlength="140" required
             placeholder="What needs to be done?" aria-label="New todo">
      <button type="submit">Create todo</button>
    </form>

    <ul>
      ${todos.map((todo) => `<li>${escapeHtml(todo)}</li>`).join('\n      ')}
    </ul>

    <footer>DevOps with Kubernetes 2026</footer>
  </body>
</html>`

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    let todos = []
    try {
      todos = await getTodos()
    } catch (err) {
      console.error(`Could not reach todo-backend: ${err.message}`)
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(renderPage(todos))
    return
  }

  if (req.method === 'GET' && req.url === '/image') {
    try {
      await ensureImage()
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' })
      fs.createReadStream(imagePath).pipe(res)
    } catch (err) {
      console.error(err.message)
      res.writeHead(502, { 'Content-Type': 'text/plain' })
      res.end('Could not get image\n')
    }
    return
  }

  if (req.method === 'GET' && req.url === '/shutdown') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Shutting down\n')
    setTimeout(() => process.exit(1), 100)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => console.log(`Server started in port ${PORT}`))
process.on('SIGTERM', () => server.close(() => process.exit(0)))
