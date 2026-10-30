const fs = require('fs')
const path = require('path')
const { test, expect } = require('@playwright/test')
const { clearDados, readDados, insertNote, findNote } = require('./emulator')

const CODE_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function codeFrom(indexes) {
  return indexes.map((index) => CODE_ALPHABET[index]).join('')
}

function glyphSpill(locator) {
  return locator.evaluateAll((nodes) =>
    nodes.map((node) => {
      const range = document.createRange()
      range.selectNodeContents(node)
      if (!node.textContent) return 0
      const text = range.getBoundingClientRect()
      const cell = node.getBoundingClientRect()
      return Math.max(cell.left - text.left, text.right - cell.right, cell.top - text.top, text.bottom - cell.bottom)
    })
  )
}

async function stubRandom(page, indexes) {
  const sequence = indexes.map((index) => (index + 0.5) / CODE_ALPHABET.length)
  await page.evaluate((values) => {
    const original = Math.random
    let cursor = 0
    Math.random = () => (cursor < values.length ? values[cursor++] : original())
  }, sequence)
}

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
      host.endsWith('.firebaseio.com') ||
      host === 'supabase.co' ||
      host.endsWith('.supabase.co')
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
            if (texts.length !== 4 || texts.some((text) => !/^[0-9A-Z]$/.test(text))) return ''
            return texts.join('')
          })
          .catch(() => '')
        return code
      },
      { intervals: [10, 20, 20, 50], timeout: 20_000 }
    )
    .toMatch(/^[0-9A-Z]{4}$/)
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

test('a wide code stays inside the parchment', async ({ page }, testInfo) => {
  const layout = layoutOf(testInfo)
  await openHome(page, layout)
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill('WMWM')
  await expect(page.getByTestId('receive-code')).toHaveValue('W M W M')
  await expect(page.getByTestId('typed-char')).toHaveText(['W', 'M', 'W', 'M'])
  const spill = await glyphSpill(page.locator('[data-testid="typed-char"]'))
  expect(spill.every((px) => px <= 1)).toBe(true)
  await expect(page.getByTestId('not-found-popup')).toBeVisible()
})

test('wide letters stay inside the code slots', async ({ page, request }, testInfo) => {
  const layout = layoutOf(testInfo)
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await stubRandom(page, [32, 32, 32, 32])
  await page.getByTestId('message-input').fill('wide letters')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  expect(code).toBe('WWWW')
  const spill = await glyphSpill(page.locator('[data-testid="code-digit"]'))
  expect(spill.every((px) => px <= 1)).toBe(true)
  expect(findNote(await readDados(request), 'WWWW')).not.toBeNull()
})

test('an unknown code opens the not-found popup', async ({ page }, testInfo) => {
  const layout = layoutOf(testInfo)
  await openHome(page, layout)
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill('0000')
  await expect(page.getByTestId('not-found-popup')).toBeVisible()
  await expect(page.getByTestId('not-found-popup')).toContainText('Pergaminho não encontrado!')
  await expect(page.getByTestId('speed-raven')).toHaveCount(0)
  await expect(page.getByTestId('received-message')).toHaveCount(0)
  await expect(page.getByText('Informe o código de 4 caracteres:')).toBeVisible()
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
  const expected = codeFrom([0, 10, 11, 12])
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await stubRandom(page, [0, 10, 11, 12])
  await page.getByTestId('message-input').fill('zero')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  expect(code).toBe(expected)
  expect(code.startsWith('0')).toBe(true)
  expect(code).toMatch(/[A-Z]/)
  const note = findNote(await readDados(request), code)
  expect(note).not.toBeNull()
  expect(note.ID).toBe(expected)
  expect(note.ID).toHaveLength(4)

  await page.waitForURL(layout.homePattern, { timeout: 15_000 })
  await page.waitForLoadState('load')
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill(code.toLowerCase())
  await expect(page.getByTestId('received-message')).toHaveValue('zero', { timeout: 15_000 })
})

test('a taken code is skipped and receive deletes only that note', async ({ page, request }, testInfo) => {
  const layout = layoutOf(testInfo)
  const taken = codeFrom([0, 10, 11, 12])
  const replacement = codeFrom([1, 2, 3, 4])
  await insertNote(request, taken, 'already there')

  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await stubRandom(page, [0, 10, 11, 12, 1, 2, 3, 4])
  await page.getByTestId('message-input').fill('second scroll')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  expect(code).toBe(replacement)

  const stored = await readDados(request)
  expect(findNote(stored, taken).Mensagem).toBe('already there')
  expect(findNote(stored, replacement).Mensagem).toBe('second scroll')

  await page.waitForURL(layout.homePattern, { timeout: 15_000 })
  await page.waitForLoadState('load')
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill(replacement)
  await expect(page.getByTestId('received-message')).toHaveValue('second scroll', { timeout: 15_000 })

  const left = await readDados(request)
  expect(findNote(left, replacement)).toBeNull()
  expect(findNote(left, taken).Mensagem).toBe('already there')
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
    window.fetch = () => Promise.reject(new Error('push refused'))
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
  await expect(page.getByTestId('speed-raven')).toHaveCount(0)

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

test('a click on the copy button puts the code on the clipboard', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const layout = layoutOf(testInfo)
  const expected = codeFrom([10, 11, 1, 2])
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await stubRandom(page, [10, 11, 1, 2])
  await page.getByTestId('message-input').fill('copy me')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  expect(code).toBe(expected)

  const button = page.getByTestId('copy-code')
  await expect(button).toBeVisible()
  await expect(button.locator('img').first()).toHaveAttribute('src', './img/copiar.png')
  await expect(button.locator('img').nth(1)).toHaveAttribute('src', './img/copiar-hover.png')
  await expect(button.locator('img').nth(1)).toBeHidden()
  await expect(button.locator('span')).toBeHidden()
  await button.hover()
  await expect(button.locator('img').first()).toBeHidden()
  await expect(button.locator('img').nth(1)).toBeVisible()
  await expect(button).toHaveCSS('cursor', 'pointer')
  await expect(button.locator('span')).toBeHidden()
  await button.click()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(expected)
  await expect(button.locator('span')).toBeVisible()
  await expect(button.locator('span')).toHaveText('Código copiado!')
  await expect(page.locator('#popup')).toBeHidden()
  await expect(page.getByTestId('popup-backdrop')).toBeHidden()
  await expect(page.getByTestId('code-digit')).toHaveText(expected.split(''))
})

test('a refused clipboard keeps the digits and opens the slate', async ({ page, context }, testInfo) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  const layout = layoutOf(testInfo)
  const expected = codeFrom([10, 11, 1, 2])
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await stubRandom(page, [10, 11, 1, 2])
  await page.getByTestId('message-input').fill('copy fails')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()
  const code = await readCode(page)
  expect(code).toBe(expected)

  await page.evaluate(() => {
    navigator.clipboard.writeText = () => Promise.reject(new Error('denied'))
  })
  await page.getByTestId('copy-code').click()
  await expect(page.locator('#popup')).toContainText('Não foi possível copiar.')
  await expect(page.getByTestId('copy-code').locator('span')).toBeHidden()
  await expect(page.locator('#angryRaven')).toBeVisible()
  await expect(page.getByTestId('code-digit')).toHaveText(expected.split(''))
})

function holdRpc(page, name) {
  let release
  const gate = new Promise((resolve) => {
    release = resolve
  })
  return page.route('**/rest/v1/rpc/' + name, async (route) => {
    await gate
    await route.continue()
  }).then(() => release)
}

async function expectBottomCorner(button) {
  const place = await button.evaluate((node) => {
    const buttonBox = node.getBoundingClientRect()
    const screen = document.getElementById('sendReceive').getBoundingClientRect()
    return {
      rightGap: screen.right - buttonBox.right,
      bottomGap: screen.bottom - buttonBox.bottom,
      leftGap: buttonBox.left - screen.left,
      topGap: buttonBox.top - screen.top,
    }
  })
  expect(place.rightGap).toBeGreaterThan(8)
  expect(place.rightGap).toBeLessThan(40)
  expect(place.bottomGap).toBeGreaterThan(8)
  expect(place.bottomGap).toBeLessThan(40)
  expect(place.leftGap).toBeGreaterThan(place.rightGap)
  expect(place.topGap).toBeGreaterThan(place.bottomGap)
}

async function stepsTaken(locator, sign) {
  await expect.poll(async () => locator.evaluate((node) => node.style.left)).toMatch(/%/)
  const start = parseFloat(await locator.evaluate((node) => node.style.left))
  const started = Date.now()
  await expect
    .poll(
      async () => {
        const now = parseFloat(await locator.evaluate((node) => node.style.left))
        return sign * (now - start)
      },
      { timeout: 2000, intervals: [20, 20, 50] }
    )
    .toBeGreaterThanOrEqual(4)
  return Date.now() - started
}

test('a click speeds the rest of the send flight', async ({ page }, testInfo) => {
  const layout = layoutOf(testInfo)
  const release = await holdRpc(page, 'enviar')
  await openHome(page, layout)
  await followLink(page, 'send-link', layout.send)
  await page.getByTestId('message-input').fill('hurry')
  await assertLoopback(page)
  await page.getByTestId('send-button').click()

  const button = page.getByTestId('speed-raven')
  await expect(button).toHaveCount(0)
  const raven = page.locator('#ravenToLeft')
  const slow = await stepsTaken(raven, -1)
  expect(slow).toBeGreaterThanOrEqual(250)
  expect(slow).toBeLessThan(900)
  await expect(button).toHaveCount(0)

  release()
  await expect(button).toBeVisible()
  await expect(button).toHaveAttribute('aria-label', 'Adiantar o corvo')
  await expect(button.locator('img').first()).toHaveAttribute('src', './img/adiantar.png')
  await expect(button.locator('img').nth(1)).toHaveAttribute('src', './img/adiantar-hover.png')
  await expect(button.locator('img').nth(1)).toBeHidden()
  await button.hover()
  await expect(button.locator('img').first()).toBeHidden()
  await expect(button.locator('img').nth(1)).toBeVisible()
  await expect(button).toHaveCSS('cursor', 'pointer')
  const height = testInfo.project.name === 'portrait' ? '72px' : '48px'
  await expect(button.locator('img').nth(1)).toHaveCSS('height', height)
  await expectBottomCorner(button)

  const left = parseFloat(await raven.evaluate((node) => node.style.left))
  const originalMs = Math.max(left - 2, 1) * 100
  const started = Date.now()
  await button.click()
  await page.waitForURL(layout.homePattern, { timeout: 15_000 })
  expect(Date.now() - started).toBeLessThan(originalMs * 0.75)
})

test('a click speeds the rest of the receive flight', async ({ page, request }, testInfo) => {
  const layout = layoutOf(testInfo)
  await insertNote(request, 'AB12', 'brought back')
  const release = await holdRpc(page, 'receber')
  await openHome(page, layout)
  await followLink(page, 'receive-link', layout.receive)
  await assertLoopback(page)
  await page.getByTestId('receive-code').fill('AB12')

  const button = page.getByTestId('speed-raven')
  await expect(button).toHaveCount(0)
  const raven = page.locator('#ravenToRight')
  const slow = await stepsTaken(raven, 1)
  expect(slow).toBeGreaterThanOrEqual(150)
  expect(slow).toBeLessThan(700)
  await expect(button).toHaveCount(0)

  release()
  await expect(button).toBeVisible()
  await expect(button).toHaveAttribute('aria-label', 'Adiantar o corvo')
  await expect(button.locator('img').first()).toHaveAttribute('src', './img/adiantar.png')
  await expect(button.locator('img').nth(1)).toHaveAttribute('src', './img/adiantar-hover.png')
  const height = testInfo.project.name === 'portrait' ? '72px' : '48px'
  await expect(button.locator('img').first()).toHaveCSS('height', height)
  await expectBottomCorner(button)

  const left = parseFloat(await raven.evaluate((node) => node.style.left))
  const originalMs = Math.max(89 - left, 1) * 60
  const started = Date.now()
  await button.click()
  await expect(page.getByTestId('received-message')).toHaveValue('brought back', { timeout: 15_000 })
  expect(Date.now() - started).toBeLessThan(originalMs * 0.75)
  await expect(button).toHaveCount(0)
})
