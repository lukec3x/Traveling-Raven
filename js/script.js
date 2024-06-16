//Nome da pasta no Banco de Dados
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
} catch (e) {
  //faz nada, já qu enão tem a menor necessidade
}

var naoEncontrado = true

function verificarEnv() {
  if (document.querySelector('div#pergaminho > textarea').value == '') {
    //alert('O corvo recusa-se a levar um pergaminho vazio!')
    document.getElementById('frente').style.display = 'flex'
    document.getElementById('fundo').style.display = 'block'
  } else
    enviar()
}

function fecharPopup() {
  document.getElementById('frente').style.display = 'none'
  document.getElementById('fundo').style.display = 'none'
}

function enviar() {
  var numLista = []
  var numRand = ''
  // Gera número de 4 ou 5 digitos
  //  Coloqui no começo para não da comflito com os frames
  for (let i = 1; i < 5; i++) { // mudei de var para let para a variavel não vazar
    numLista[i - 1] = (Math.floor(Math.random() * 10 + 1 - 1)).toString()
    numRand += numLista[i - 1]
  }

  // Pega a string do textarea antes que ele seja apagado
  var msg = document.querySelector('div#pergaminho textarea').value
  try {
    document.getElementById('envRec').innerHTML = ''
  } catch (error) {
    document.getElementById('main-mobile-2').innerHTML = ''
  }

  // Cria a imagem
  var obj1 = document.createElement('img')
  obj1.id = 'ravenToLeft'
  obj1.src = './img/ravenToLeft.gif'
  try {
    document.getElementById('envRec').style.position = 'relative'
    document.getElementById('envRec').appendChild(obj1)
  } catch (e) {
    document.getElementById('main-mobile-2').style.position = 'relative'
    document.getElementById('main-mobile-2').appendChild(obj1)
  }

  var objA = document.createElement('a')
  objA.href = './index.html'
  objA.id = 'voltar'
  try {
    document.getElementById('envRec').appendChild(objA)
  } catch (error) {
    document.getElementById('main-mobile-2').appendChild(objA)
  }

  var objImg = document.createElement('img')
  objImg.src = './img/home.png'
  document.getElementById('voltar').appendChild(objImg)

  let w = window.innerWidth
  let h = window.innerHeight
  if (h > w) {
    var i = 88
  } else {
    var i = 84
  }
  obj1.style.left = `${i}%`

  var obj2 = document.createElement('section')
  obj2.id = 'areaDoCod'
  try {
    document.getElementById('envRec').appendChild(obj2)
  } catch (error) {
    document.getElementById('main-mobile-2').appendChild(obj2)
  }

  var objp = document.createElement('p')
  objp.innerText = 'Seu código:'
  document.querySelector('main > section').appendChild(objp)

  // Div com a imagem de fundo
  var obj3 = document.createElement('div')
  obj3.id = 'fundCod'
  document.querySelector('main > section').appendChild(obj3)

  // As 4 Divs com os números separados
  var obj4 = document.createElement('div')
  obj4.style.gridArea = 'p1'
  document.querySelector('main > section > div').appendChild(obj4)

  var obj5 = document.createElement('div')
  obj5.style.gridArea = 'p2'
  document.querySelector('main > section > div').appendChild(obj5)

  var obj6 = document.createElement('div')
  obj6.style.gridArea = 'p3'
  document.querySelector('main > section > div').appendChild(obj6)

  var obj7 = document.createElement('div')
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

  // Controla o frame da imagem
  var frames = 100 // Valor de uso: 100
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

const veriCod = () => {

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

    recInputCod()

  } else {
    i0.value = `${newCod[0]} ${newCod[1]} ${newCod[2]} ${newCod[3]}`
  }
}

function recInputCod() {
  //alert('chama função do corvo')

  i0.readOnly = true

  var recebido = false
  //funcao de busca dos dados

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

        // Apaga a mensagem do banco
        firebase.database().ref(dbName).child(childSnapshot.key).remove()
        //firebase.database().ref('dados').child(childSnapshot.key).remove()
        //firebase.database().ref('dados').child(childSnapshot.key).remove()

        recebido = true
        naoEncontrado = false
        //console.log('Vai ficar com erro mesmo')
        //return value === db.ID
      }
    })

    if (naoEncontrado) {
      document.getElementById('frente').style.display = 'flex'
      document.getElementById('fundo').style.display = 'block'

      document.getElementById('fundo').addEventListener('click', function(){
        window.location.href = './receber.html'
      })
    }
  })

  // Controla o frame da imagem
  var frames = 60 // Valor de uso: 100
  var i = 1
  var raven = document.getElementById('ravenToRight')

  document.getElementById('ravenWaiting').style.display = 'none'
  raven.style.display = 'inline-block'

  var myvar = setInterval(function () {
    raven.style.left = `${i}%`
    i++

    if (recebido == true && i == 90) {
      //faaz a mudança de tela
      try {
        document.getElementById('envRec').innerHTML = ''
      } catch (error) {
        document.getElementById('main-mobile-2').innerHTML = ''
      }

      var obj1 = document.createElement('a')
      obj1.id = 'voltar'
      obj1.href = 'index.html'
      try {
        document.getElementById('envRec').appendChild(obj1)
      } catch (e) {
        document.getElementById('main-mobile-2').appendChild(obj1)
      }

      var objImg = document.createElement('img')
      objImg.src = './img/home.png'
      document.getElementById('voltar').appendChild(objImg)

      var obj3 = document.createElement('section')
      obj3.id = 'recMsg'
      try {
        document.getElementById('envRec').appendChild(obj3)
      } catch (error) {
        document.getElementById('main-mobile-2').appendChild(obj3)
      }

      var obj4 = document.createElement('div')
      obj4.id = 'pergaminho'
      document.querySelector('main section#recMsg').appendChild(obj4)

      var obj5 = document.createElement('textarea')
      obj5.autofocus = true
      obj5.readOnly = true
      obj5.innerText = mensg
      document.getElementById('pergaminho').append(obj5)

    } else if (recebido == false && i == 90) {
      i = 1
    }
  }, frames)
}