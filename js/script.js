// Database folder name
var dbName = 'dados' //'dados' //'dadosTeste'

var firebaseConfig = {
  apiKey: "AIzaSyB4NkRTwFwExEGubKl342IlAnJLymhsEjQ",
  authDomain: "raven-traveler.firebaseapp.com",
  databaseURL: "https://raven-traveler.firebaseio.com",
  projectId: "raven-traveler",
  storageBucket: "",
  messagingSenderId: "934556866038",
  appId: "1:934556866038:web:c1750103b56fbb94"
}

try {
  firebase.initializeApp(firebaseConfig)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    firebase.database().useEmulator('127.0.0.1', 9000)
  }
} catch (e) {
  // Home has no Firebase SDK. Ignore the missing global.
}

var naoEncontrado = true

function checkSend() {
  if (document.querySelector('div#scroll > textarea').value == '') {
    //alert('The raven refuses to carry an empty scroll!')
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
  var numLista = []
  var numRand = ''
  // Build a 4-digit code before the frames start
  // so the loop variable does not clash with the animation index
  for (let i = 1; i < 5; i++) { // let keeps the counter inside the loop
    numLista[i - 1] = (Math.floor(Math.random() * 10 + 1 - 1)).toString()
    numRand += numLista[i - 1]
  }

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
  objp.innerText = 'Your code:'
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

  firebase.database().ref(dbName).push({
    //firebase.database().ref('dadosTeste').push({
    //firebase.database().ref('dados').push({
    "ID": numRand,
    "Mensagem": msg
  }).then(function (data) {
    console.log(numLista)
    console.log(numRand)

    obj4.innerText = numLista[0]
    obj5.innerText = numLista[1]
    obj6.innerText = numLista[2]
    obj7.innerText = numLista[3]
    recebido = true
  }).catch(function (error) {
    alert(error)
    console.error(error)
  })

  // Advance the raven frame
  var frames = 100 // In use: 100
  var myvar = setInterval(function () {
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

const formatCode = () => {

  newCod = i0.value.replace(/\D/g, '')

  if (newCod.length === 0) {
    return
  } else if (newCod.length === 1) {
    console.log('1 number')
    console.log(newCod)
    i0.value = newCod
  } else if (newCod.length === 2) {
    console.log('2 numbers')
    console.log(newCod)
    i0.value = `${newCod[0]} ${newCod[1]}`
  } else if (newCod.length === 3) {
    console.log('3 numbers')
    console.log(newCod)
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]}`
  } else if (newCod.length === 4) {
    console.log('4 numbers')
    console.log(newCod)
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]} ${newCod[3]}`

    receiveCode()

  } else {
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]} ${newCod[3]}`
  }
}

function receiveCode() {
  //alert('call the raven')

  i0.readOnly = true

  var recebido = false
  // Look up the note

  var mensg = ''

  var query = firebase.database().ref(dbName).orderByKey();
  //var query = firebase.database().ref("dadosTeste").orderByKey();
  //var query = firebase.database().ref("dados").orderByKey();
  query.once("value").then(function (snapshot) {

    snapshot.forEach(function (childSnapshot) {
      var db = childSnapshot.val()
      var buscId = `${newCod[0]}${newCod[1]}${newCod[2]}${newCod[3]}`

      if (db.ID == buscId) {
        mensg = db.Mensagem

        // Delete the note from the database
        firebase.database().ref(dbName).child(childSnapshot.key).remove()
        //firebase.database().ref('dados').child(childSnapshot.key).remove()
        //firebase.database().ref('dados').child(childSnapshot.key).remove()

        recebido = true
        naoEncontrado = false
        //console.log('this error stays')
        //return value === db.ID
      }
    })

    if (naoEncontrado) {
      document.getElementById('popup').style.display = 'flex'
      document.getElementById('backdrop').style.display = 'block'

      document.getElementById('backdrop').addEventListener('click', function(){
        window.location.href = './receive.html'
      })
    }
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