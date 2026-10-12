const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')

const directory = path.join('/', 'usr', 'src', 'app', 'files')
const filePath = path.join(directory, 'log.txt')

// Δημιουργείται ΜΙΑ φορά στο startup
const randomString = randomUUID()

// Σιγουρευόμαστε ότι υπάρχει ο φάκελος
fs.mkdirSync(directory, { recursive: true })

const writeLine = () => {
  const line = `${new Date().toISOString()}: ${randomString}`
  fs.appendFileSync(filePath, line + '\n')   // προσθέτει γραμμή στο τέλος του αρχείου
  console.log(line)                           // και στα logs, για έλεγχο
}

writeLine()
setInterval(writeLine, 5000)

process.on('SIGTERM', () => process.exit(0))
