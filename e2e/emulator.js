const DADOS = 'http://127.0.0.1:9000/dados.json?ns=raven-traveler'

function assertEmulatorUrl() {
  const url = new URL(DADOS)
  if (url.hostname !== '127.0.0.1' || url.port !== '9000' || url.pathname !== '/dados.json') {
    throw new Error('Refusing a request that is not the local dados emulator')
  }
}

async function clearDados(request) {
  assertEmulatorUrl()
  const response = await request.delete(DADOS)
  if (!response.ok()) {
    throw new Error('Emulator DELETE failed with status ' + response.status())
  }
}

async function readDados(request) {
  assertEmulatorUrl()
  const response = await request.get(DADOS)
  if (!response.ok()) {
    throw new Error('Emulator GET failed with status ' + response.status())
  }
  return response.json()
}

function findNote(tree, id) {
  if (tree == null || typeof tree !== 'object') return null
  const matches = Object.values(tree).filter((child) => child && child.ID === id)
  return matches.length === 1 ? matches[0] : null
}

module.exports = { clearDados, readDados, findNote }
