const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const IMAGE_URL = process.env.IMAGE_URL || 'https://picsum.photos/1200'
const MAX_AGE_MS = (parseInt(process.env.IMAGE_MAX_AGE_SECONDS, 10) || 600) * 1000

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const imagePath = path.join(directory, 'image.jpg')

fs.mkdirSync(directory, { recursive: true })

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

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>The project App</title>
    <style>
      body { font-family: sans-serif; max-width: 640px; margin: 2rem auto; padding: 0 1rem; }
      img { width: 100%; height: auto; }
      footer { margin-top: 2rem; color: #666; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>The project App</h1>
    <img src="/image" alt="Random image from Lorem Picsum">
    <footer>DevOps with Kubernetes 2026</footer>
  </body>
</html>`

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
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
