const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const IMAGE_URL = process.env.IMAGE_URL || 'https://picsum.photos/1200'
const MAX_AGE_MS = (parseInt(process.env.IMAGE_MAX_AGE_SECONDS, 10) || 600) * 1000

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const imagePath = path.join(directory, 'image.jpg')

fs.mkdirSync(directory, { recursive: true })

// Hardcoded todos (θα έρθουν από το todo-backend στην 2.2)
const todos = [
  'Learn JavaScript',
  'Learn React',
  'Build a project',
]

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Πόσο παλιά είναι η εικόνα (ms), ή null αν δεν υπάρχει
const imageAge = () => {
  try {
    return Date.now() - fs.statSync(imagePath).mtimeMs
  } catch {
    return null
  }
}

// Κατεβάζει νέα εικόνα. Αν τρέχει ήδη download, δεν ξεκινάει δεύτερο.
let downloading = null
const downloadImage = () => {
  if (downloading) return downloading
  downloading = (async () => {
    console.log('Downloading new image...')
    const response = await fetch(IMAGE_URL)
    if (!response.ok) throw new Error(`Download failed: ${response.status}`)
    const buffer = Buffer.from(await response.arrayBuffer())
    const tmpPath = imagePath + '.tmp'
    fs.writeFileSync(tmpPath, buffer)
    fs.renameSync(tmpPath, imagePath)
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

const renderPage = () => `<!DOCTYPE html>
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
      #counter { color: #666; font-size: 0.85rem; margin-top: 0.25rem; }
      ul { padding-left: 1.25rem; }
      li { margin: 0.25rem 0; }
      footer { margin-top: 2rem; color: #666; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>The project App</h1>
    <img src="/image" alt="Random image from Lorem Picsum">

    <form onsubmit="return false">
      <input id="todo-input" type="text" name="todo" maxlength="140"
             placeholder="What needs to be done?" aria-label="New todo">
      <button type="button">Create todo</button>
    </form>
    <div id="counter">0 / 140</div>

    <ul>
      ${todos.map((todo) => `<li>${escapeHtml(todo)}</li>`).join('\n      ')}
    </ul>

    <footer>DevOps with Kubernetes 2026</footer>

    <script>
      const input = document.getElementById('todo-input')
      const counter = document.getElementById('counter')
      input.addEventListener('input', () => {
        counter.textContent = input.value.length + ' / 140'
      })
    </script>
  </body>
</html>`

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(renderPage())
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

  // Μόνο για δοκιμές: τερματίζει το container
  if (req.method === 'GET' && req.url === '/shutdown') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Shutting down\n')
    console.log('Shutdown requested')
    setTimeout(() => process.exit(1), 100)
    return
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
