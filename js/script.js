// Local API from `supabase start`. Any other host uses the linked production project.
// An empty pair fails the send instead of calling loopback.
var localSupabaseUrl = 'http://127.0.0.1:54321'
var localSupabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

var productionSupabaseUrl = 'https://xcfetfqmpfimhqeuqnbq.supabase.co'
var productionSupabaseKey = 'sb_publishable_dBgwe-IAorbj8nOd8DigVA_CKHE6gxm'

var supabaseUrl = localSupabaseUrl
var supabaseKey = localSupabaseKey
if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
  supabaseUrl = productionSupabaseUrl
  supabaseKey = productionSupabaseKey
}

var codeAlphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function rpc(name, body) {
  if (!supabaseUrl || !supabaseKey) {
    return Promise.reject(new Error('missing supabase config'))
  }
  return fetch(supabaseUrl + '/rest/v1/rpc/' + name, {
    method: 'POST',
    headers: {
      apikey: supabaseKey,
      Authorization: 'Bearer ' + supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }).then(function (response) {
    if (!response.ok) throw new Error('rpc failed')
    return response.json()
  })
}

function drawCode() {
  var chars = []
  var code = ''
  for (var n = 0; n < 4; n++) {
    var ch = codeAlphabet.charAt(Math.floor(Math.random() * codeAlphabet.length))
    chars.push(ch)
    code += ch
  }
  return { chars: chars, code: code }
}

var naoEncontrado = true

function checkSend() {
  if (document.querySelector('div#scroll > textarea').value == '') {
    document.getElementById('popup').style.display = 'flex'
    document.getElementById('backdrop').style.display = 'block'
  } else
    send()
}

function closePopup() {
  document.getElementById('popup').style.display = 'none'
  document.getElementById('backdrop').style.display = 'none'
}

function send() {
  // Read the textarea before it is cleared
  var msg = document.querySelector('div#scroll textarea').value
  var main = document.getElementById('sendReceive')
  main.innerHTML = ''

  // Create the raven image
  var obj1 = document.createElement('img')
  obj1.id = 'ravenToLeft'
  obj1.src = './img/ravenToLeft.gif'
  main.style.position = 'relative'
  main.appendChild(obj1)

  var objA = document.createElement('a')
  objA.href = './index.html'
  objA.id = 'back'
  main.appendChild(objA)

  var objImg = document.createElement('img')
  objImg.src = './img/home.png'
  document.getElementById('back').appendChild(objImg)

  let w = window.innerWidth
  let h = window.innerHeight
  if (h > w) {
    var i = 88
  } else {
    var i = 84
  }
  obj1.style.left = `${i}%`

  var obj2 = document.createElement('section')
  obj2.id = 'codeArea'
  main.appendChild(obj2)

  var objp = document.createElement('p')
  objp.innerText = 'Seu código:'
  document.querySelector('main > section').appendChild(objp)

  // Digit grid background
  var obj3 = document.createElement('div')
  obj3.id = 'codeDigits'
  document.querySelector('main > section').appendChild(obj3)

  // Four separate digit cells
  var obj4 = document.createElement('div')
  obj4.dataset.testid = 'code-digit'
  obj4.style.gridArea = 'p1'
  document.querySelector('main > section > div').appendChild(obj4)

  var obj5 = document.createElement('div')
  obj5.dataset.testid = 'code-digit'
  obj5.style.gridArea = 'p2'
  document.querySelector('main > section > div').appendChild(obj5)

  var obj6 = document.createElement('div')
  obj6.dataset.testid = 'code-digit'
  obj6.style.gridArea = 'p3'
  document.querySelector('main > section > div').appendChild(obj6)

  var obj7 = document.createElement('div')
  obj7.dataset.testid = 'code-digit'
  obj7.style.gridArea = 'p4'
  document.querySelector('main > section > div').appendChild(obj7)

  var recebido = false
  var sendFailed = false
  var flight = null
  var tries = 0

  function stopFailedSend() {
    sendFailed = true
    clearInterval(flight)
    obj1.style.display = 'none'
    document.getElementById('codeArea').style.display = 'none'
  }

  function showSendFailure(error) {
    stopFailedSend()
    var popup = document.getElementById('popup')
    popup.dataset.testid = 'send-error-popup'
    popup.querySelector('p').innerText = 'O corvo não conseguiu entregar o pergaminho!'
    popup.style.display = 'flex'
    document.getElementById('backdrop').style.display = 'block'
    if (error) console.error(error)
  }

  function showCopyStatus(text) {
    var popup = document.getElementById('popup')
    popup.querySelector('p').innerText = text
    popup.style.display = 'flex'
    document.getElementById('backdrop').style.display = 'block'
  }

  function copyCode() {
    var code = obj4.textContent + obj5.textContent + obj6.textContent + obj7.textContent
    var write = navigator.clipboard && window.isSecureContext
      ? navigator.clipboard.writeText(code)
      : Promise.reject(new Error('clipboard unavailable'))
    write.then(function () {
      var hint = document.querySelector('#copyCode span')
      hint.innerText = 'Código copiado!'
      document.getElementById('copyCode').classList.add('copied')
    }).catch(function () {
      showCopyStatus('Não foi possível copiar.')
    })
  }

  function showCopyButton() {
    var button = document.createElement('button')
    button.type = 'button'
    button.id = 'copyCode'
    button.dataset.testid = 'copy-code'
    button.setAttribute('aria-label', 'Copiar o código')
    var icon = document.createElement('img')
    icon.src = './img/copiar.png'
    icon.alt = ''
    button.appendChild(icon)
    var hoverIcon = document.createElement('img')
    hoverIcon.src = './img/copiar-hover.png'
    hoverIcon.alt = ''
    button.appendChild(hoverIcon)
    var hint = document.createElement('span')
    hint.setAttribute('aria-live', 'polite')
    button.appendChild(hint)
    button.addEventListener('click', copyCode)
    document.getElementById('codeArea').appendChild(button)
  }

  function trySend() {
    if (sendFailed) return
    if (tries >= 20) {
      showSendFailure()
      return
    }
    tries += 1
    var attempt = drawCode()
    rpc('enviar', { codigo: attempt.code, mensagem: msg }).then(function (stored) {
      if (sendFailed) return
      if (stored === true) {
        obj4.innerText = attempt.chars[0]
        obj5.innerText = attempt.chars[1]
        obj6.innerText = attempt.chars[2]
        obj7.innerText = attempt.chars[3]
        recebido = true
        showCopyButton()
        return
      }
      trySend()
    }).catch(function (error) {
      if (sendFailed) return
      showSendFailure(error)
    })
  }

  trySend()

  // Advance the raven frame
  var frames = 100 // In use: 100
  flight = setInterval(function () {
    if (sendFailed) {
      clearInterval(flight)
      return
    }
    obj1.style.left = `${i}%`
    i--

    if (recebido == true && i == 1) {
      window.location.href = './index.html'
    } else if (recebido == false && i == 1) {
      i = 88
    }
  }, frames)
}

var i0 = document.getElementById('i0')
var newCod

function paintEntry(chars) {
  var cells = document.querySelectorAll('#codeEntry [data-testid="typed-char"]')
  for (var n = 0; n < cells.length; n++) {
    cells[n].textContent = chars[n] || ''
  }
}

const formatCode = () => {
  newCod = i0.value.replace(/[^0-9a-zA-Z]/g, '').toUpperCase()
  paintEntry(newCod)

  if (newCod.length === 0) {
    i0.value = ''
    return
  } else if (newCod.length === 1) {
    i0.value = newCod
  } else if (newCod.length === 2) {
    i0.value = `${newCod[0]} ${newCod[1]}`
  } else if (newCod.length === 3) {
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]}`
  } else if (newCod.length === 4) {
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]} ${newCod[3]}`
    receiveCode()
  } else {
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]} ${newCod[3]}`
  }
}

function showNotFound() {
  document.getElementById('popup').style.display = 'flex'
  document.getElementById('backdrop').style.display = 'block'

  document.getElementById('backdrop').addEventListener('click', function () {
    window.location.href = './receive.html'
  })
}

function receiveCode() {
  i0.readOnly = true

  var recebido = false
  var mensg = ''
  var codigo = `${newCod[0]}${newCod[1]}${newCod[2]}${newCod[3]}`

  rpc('receber', { codigo: codigo }).then(function (texto) {
    if (typeof texto === 'string') {
      mensg = texto
      recebido = true
      naoEncontrado = false
    }

    if (naoEncontrado) showNotFound()
  }).catch(function () {
    showNotFound()
  })

  // Advance the raven frame
  var frames = 60 // In use: 60
  var i = 1
  var raven = document.getElementById('ravenToRight')

  document.getElementById('ravenWaiting').style.display = 'none'
  raven.style.display = 'inline-block'

  var myvar = setInterval(function () {
    raven.style.left = `${i}%`
    i++

    if (recebido == true && i == 90) {
      // Swap the screen for the received scroll
      var main = document.getElementById('sendReceive')
      main.innerHTML = ''

      var obj1 = document.createElement('a')
      obj1.id = 'back'
      obj1.href = 'index.html'
      main.appendChild(obj1)

      var objImg = document.createElement('img')
      objImg.src = './img/home.png'
      document.getElementById('back').appendChild(objImg)

      var obj3 = document.createElement('section')
      obj3.id = 'received'
      main.appendChild(obj3)

      var obj4 = document.createElement('div')
      obj4.id = 'scroll'
      document.querySelector('main section#received').appendChild(obj4)

      var obj5 = document.createElement('textarea')
      obj5.dataset.testid = 'received-message'
      obj5.autofocus = true
      obj5.readOnly = true
      obj5.innerText = mensg
      document.getElementById('scroll').append(obj5)

    } else if (recebido == false && i == 90) {
      i = 1
    }
  }, frames)
}
