var firebaseConfig = {
    apiKey: "AIzaSyB4NkRTwFwExEGubKl342IlAnJLymhsEjQ",
    authDomain: "raven-traveler.firebaseapp.com",
    databaseURL: "https://raven-traveler.firebaseio.com",
    projectId: "raven-traveler",
    storageBucket: "",
    messagingSenderId: "934556866038",
    appId: "1:934556866038:web:c1750103b56fbb94"
}

firebase.initializeApp(firebaseConfig)

var statusEnv = 0
var statusRec = 0

var naoEncontrado = true

var part2 = document.getElementById('part2')


function verificarEnv() {
    if (document.querySelector('div#pergaminho > textarea').value == '')
        alert('O corvo recusa-se a levar um pergaminho vazio!')
    else
        enviar()
}
function enviar() {
    var numLista = []
    var numRand = ''
    // Gera número de 4 ou 5 digitos
    //  Coloqui no começo para não da comflito com os frames
    for (var i = 1; i < 5; i++) {
        numLista[i -1] = (Math.floor(Math.random() * 10 + 1 -1)).toString()
        numRand += numLista[i -1]
    }

    // Cria a imagem
    var obj1 = document.createElement('img')
    obj1.width = '70'
    obj1.src = './img/ravenToLeft.gif'
    obj1.style.position = 'absolute'
    // Pega a string do textarea antes que ele seja apagado
    var msg = document.querySelector('div#pergaminho textarea').value
    document.getElementById('envRec').innerHTML = ''
    document.getElementById('envRec').style.position = 'relative'
    document.getElementById('envRec').appendChild(obj1)

    var i = 88
    obj1.style.left = `${i}%`

    var obj2 = document.createElement('section')
    obj2.style.display = 'flex'
    obj2.style.alignItems = 'center'
    obj2.style.justifyContent = 'space-around'
    obj2.style.position = 'absolute'
    obj2.style.width = '100%'
    obj2.style.height = '50%'
    obj2.style.top = '50%'
    document.getElementById('envRec').appendChild(obj2)

    // Div com a imagem de fundo
    var obj3 = document.createElement('div')
    obj3.id = 'fundCod'
    obj3.style.width = '100px'
    obj3.style.height = '40px'
    obj3.style.backgroundImage = 'url(./img/fundoCod.png)'
    obj3.style.backgroundRepeat = 'no-repeat'
    obj3.style.backgroundSize = 'contain'
    // Os estilos de grid ta no CSS
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

    firebase.database().ref('dados').push({
        "ID": numRand,
        "Mensagem": msg
    }).then(function(data){
        console.log(numLista)
        console.log(numRand)

        obj4.innerText = numLista[0]
        obj5.innerText = numLista[1]
        obj6.innerText = numLista[2]
        obj7.innerText = numLista[3]
        recebido = true
    }).catch(function(error){
        alert(error)
        console.error(error)
    })

    // Controla o frame da imagem
    var frames = 100  // Valor de uso: 100
    var myvar = setInterval(function() {
        obj1.style.left = `${i}%`
        i--

        if (recebido == true && i == 1) {
            window.location.href = './index.html'
        } else if (recebido == false && i == 1) {
            i = 88
        }
    }, frames)
}

function receber() {
    
}

function envTxt() {
    var msg = document.getElementById('msg').value

    // Gera número de 4 ou 5 digitos
    for (var i = 1; i < 5; i++) {
        numRand += (Math.floor(Math.random() * 10 + 1 -1)).toString()
    }

    firebase.database().ref('dados').push({
        "ID": numRand,
        "Mensagem": msg
    }).then(function(data){
        alert(`Seu identificador é ${numRand}`)
        numRand = ''
    }).catch(function(error){
        alert(error)
        console.error(error)
    })

    document.getElementById('msg').value = ''
}

function recTxt() {
    var query = firebase.database().ref("dados").orderByKey();
    query.once("value").then(function(snapshot) {
        
        snapshot.forEach(function(childSnapshot) {
            var db = childSnapshot.val()
            var buscId = document.getElementById("buscId").value

            if (db.ID == buscId) {
                document.getElementById("msg").value = db.Mensagem
                naoEncontrado = false
                console.log('Vai ficar com erro mesmo')
                return value === db.ID
            } 
        })

        if (naoEncontrado) {
            alert('Identificador não encontrado!')
        }
    })
}