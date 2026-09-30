const { randomUUID } = require('crypto')

// Δημιουργείται ΜΙΑ φορά στο startup και μένει στη μνήμη
const randomString = randomUUID()

const printStatus = () => {
  console.log(`${new Date().toISOString()}: ${randomString}`)
}

printStatus()
setInterval(printStatus, 5000)

// Για να κλείνει αμέσως όταν το Kubernetes σταματάει το pod
process.on('SIGTERM', () => process.exit(0))
