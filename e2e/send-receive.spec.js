const fs = require('fs')
const path = require('path')
const { test, expect } = require('@playwright/test')
const { clearDados, readDados, findNote } = require('./emulator')

function layoutOf() {
  return {
    home: '/index.html',
    send: '/send.html',
    receive: '/receive.html',
    homePattern: /\/index\.html$/,
  }
}

async function blockRemote(page) {
  await page.route('**/*', (route) => {
    const host = new URL(route.request().url()).hostname
    const blocked =
      host === 'wurfl.io' ||
      host.endsWith('.wurfl.io') ||
      host === 'fonts.googleapis.com' ||
      host === 'fonts.gstatic.com' ||
      host === 'firebaseio.com' ||
      host.endsWith('.firebaseio.com')
    if (blocked) return route.abort()
    return route.continue()
  })
}

function urlPattern(path) {
  return new RegExp(path.replace('.', '\\.') + '$')
}

async function openHome(page, layout) {
  await page.goto(layout.home, { waitUntil: 'load' })
  await expect(page).toHaveURL(urlPattern(layout.home))
}

async function followLink(page, testId, path) {
  await page.getByTestId(testId).click()
  await page.waitForURL(urlPattern(path))
  await page.waitForLoadState('load')
}

async function assertLoopback(page) {
  const host = await page.evaluate(() => location.hostname)
  expect(host, 'send and receive stay on the emulator host').toBe('127.0.0.1')
}

async function readCode(page) {
  let code = ''
  await expect
    .poll(
      async () => {
        code = await page
          .evaluate(() => {
            const texts = [...document.querySelectorAll('[data-testid="code-digit"]')].map((node) =>
              (node.textContent || '').trim()
            )
            if (texts.length !== 4 || texts.some((text) => !/^\d$/.test(text))) return ''
            return texts.join('')
          })
          .catch(() => '')
        return code
      },
      { intervals: [10, 20, 20, 50], timeout: 20_000 }
    )
    .toMatch(/^\d{4}$/)
  return code
}

async function sendNote(page, layout, message) {
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await page.getByTestId('message-input').fill(message)
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  return code
}

test.beforeEach(async ({ page, request }) => {
  await clearDados(request)
  await blockRemote(page)
})

test.afterEach(async ({ request }) => {
  await clearDados(request)
})

test('empty scroll opens the popup and writes nothing', async ({ page, request }, testInfo) => {
  const layout = layoutOf(testInfo)
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  await expect(page.getByTestId('empty-popup')).toBeVisible()
  await expect(page.getByTestId('empty-popup')).toContainText('O corvo recusa-se a levar um pergaminho vazio!')
  await expect(page.getByTestId('popup-backdrop')).toBeVisible()
  await expect(page).toHaveTitle('Enviar | Raven Traveler')
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-br')
  expect(await readDados(request)).toBeNull()
})

test('a note is stored once and a second read is not found', async ({ page, request }, testInfo) => {
  const layout = layoutOf(testInfo)
  const message = 'hello raven'
  const code = await sendNote(page, layout, message)
  const stored = await readDados(request)
  expect(stored && typeof stored === 'object' ? Object.keys(stored) : []).toHaveLength(1)
  const note = findNote(stored, code)
  expect(note).not.toBeNull()
  expect(note.ID).toBe(code)
  expect(typeof note.ID).toBe('string')
  expect(note.Mensagem).toBe(message)

  await page.waitForURL(layout.homePattern, { timeout: 15_000 })
  await page.waitForLoadState('load')

  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill(code)
  const received = page.getByTestId('received-message')
  await expect(received).toHaveValue(message, { timeout: 15_000 })
  await expect(received).toHaveJSProperty('readOnly', true)
  expect(await readDados(request)).toBeNull()

  await page.goto(layout.receive, { waitUntil: 'load' })
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill(code)
  await expect(page.getByTestId('not-found-popup')).toBeVisible()
  await expect(page.getByTestId('not-found-popup')).toContainText('Pergaminho não encontrado!')
})

test('an unknown code opens the not-found popup', async ({ page }, testInfo) => {
  const layout = layoutOf(testInfo)
  await openHome(page, layout)
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill('0000')
  await expect(page.getByTestId('not-found-popup')).toBeVisible()
  await expect(page.getByTestId('not-found-popup')).toContainText('Pergaminho não encontrado!')
  await expect(page.getByTestId('received-message')).toHaveCount(0)
  await expect(page).toHaveTitle('Receber | Raven Traveler')
})

test('retired portuguese urls do not serve a screen', async ({ page }) => {
  for (const path of [
    '/enviar.html',
    '/receber.html',
    '/index-mobile.html',
    '/enviar-mobile.html',
    '/receber-mobile.html',
  ]) {
    const response = await page.goto(path, { waitUntil: 'load' })
    expect(response.status()).toBe(404)
  }
})

test('a leading zero is stored and read as four characters', async ({ page, request }, testInfo) => {
  const layout = layoutOf(testInfo)
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await page.evaluate(() => {
    const original = Math.random
    const sequence = [0, 0.1, 0.2, 0.3]
    let index = 0
    Math.random = () => (index < sequence.length ? sequence[index++] : original())
  })
  await page.getByTestId('message-input').fill('zero')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  expect(code).toBe('0123')
  const note = findNote(await readDados(request), code)
  expect(note).not.toBeNull()
  expect(note.ID).toBe('0123')
  expect(note.ID).toHaveLength(4)

  await page.waitForURL(layout.homePattern, { timeout: 15_000 })
  await page.waitForLoadState('load')
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill(code)
  await expect(page.getByTestId('received-message')).toHaveValue('zero', { timeout: 15_000 })
})

test('a refused push opens the slate and stops the raven', async ({ page, request }, testInfo) => {
  const source = fs.readFileSync(path.join(__dirname, '..', 'js', 'script.js'), 'utf8')
  expect(source).not.toMatch(/\b(alert|confirm|prompt)\b/)

  const layout = layoutOf(testInfo)
  const expectedLeft = testInfo.project.name === 'portrait' ? '88%' : '84%'
  let nativeDialog = ''
  page.on('dialog', async (dialog) => {
    nativeDialog = dialog.message()
    await dialog.dismiss()
  })

  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await page.evaluate(() => {
    firebase.database.Reference.prototype.push = function () {
      return Promise.reject(new Error('push refused'))
    }
  })
  await page.getByTestId('message-input').fill('lost scroll')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()

  const slate = page.getByTestId('send-error-popup')
  await expect(slate).toBeVisible()
  await expect(slate).toContainText('O corvo não conseguiu entregar o pergaminho!')
  await expect(page.getByTestId('empty-popup')).toHaveCount(0)
  await expect(page.getByTestId('popup-backdrop')).toBeVisible()
  expect(await readDados(request)).toBeNull()
  expect(nativeDialog).toBe('')
  expect(new URL(page.url()).pathname).toBe('/send.html')
  await expect(page.getByTestId('message-input')).toHaveCount(0)
  const digits = page.getByTestId('code-digit')
  await expect(digits).toHaveCount(4)
  expect((await digits.allTextContents()).map((text) => text.trim())).toEqual(['', '', '', ''])
  await expect(page.locator('#codeArea')).toBeHidden()

  const raven = page.locator('#ravenToLeft')
  await expect(raven).toBeHidden()
  const left = await raven.evaluate((node) => node.style.left)
  await page.waitForTimeout(150)
  const leftLater = await raven.evaluate((node) => node.style.left)
  expect(left).toBe(expectedLeft)
  expect(leftLater).toBe(left)

  // The slate sits in the middle of the page, over the backdrop's center.
  await page.getByTestId('popup-backdrop').click({ position: { x: 20, y: 20 } })
  await expect(slate).toBeHidden()
  await expect(page.getByTestId('popup-backdrop')).toBeHidden()
  expect(new URL(page.url()).pathname).toBe('/send.html')
  await expect(page.getByTestId('message-input')).toHaveCount(0)
  await expect(slate).toHaveCount(1)
  await expect(page.locator('a#back')).toHaveCount(1)
  await expect(raven).toHaveCount(1)
  expect(await raven.evaluate((node) => node.style.left)).toBe(left)
  expect(nativeDialog).toBe('')
})
