const DADOS = 'http://127.0.0.1:54321/rest/v1/dados'

// Published local demo key from `supabase start`. Not a production secret.
const SERVICE_ROLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

function assertLocalApi() {
  const url = new URL(DADOS)
  if (url.hostname !== '127.0.0.1' || url.port !== '54321' || url.pathname !== '/rest/v1/dados') {
    throw new Error('Refusing a request that is not the local dados API')
  }
}

function serviceHeaders() {
  assertLocalApi()
  return {
    apikey: SERVICE_ROLE,
    Authorization: 'Bearer ' + SERVICE_ROLE,
    'Content-Type': 'application/json',
  }
}

async function clearDados(request) {
  const response = await request.delete(DADOS + '?ID=not.is.null', {
    headers: serviceHeaders(),
  })
  if (!response.ok()) {
    throw new Error('Local DELETE failed with status ' + response.status())
  }
}

async function readDados(request) {
  const response = await request.get(DADOS, { headers: serviceHeaders() })
  if (!response.ok()) {
    throw new Error('Local GET failed with status ' + response.status())
  }
  const body = await response.json()
  if (Array.isArray(body) && body.length === 0) return null
  return body
}

async function insertNote(request, id, message) {
  const response = await request.post(DADOS, {
    headers: Object.assign({ Prefer: 'return=minimal' }, serviceHeaders()),
    data: { ID: id, Mensagem: message },
  })
  if (!response.ok()) {
    throw new Error('Local POST failed with status ' + response.status())
  }
}

function findNote(tree, id) {
  if (tree == null || typeof tree !== 'object') return null
  const matches = Object.values(tree).filter((child) => child && child.ID === id)
  return matches.length === 1 ? matches[0] : null
}

module.exports = { clearDados, readDados, insertNote, findNote }
