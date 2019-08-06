var firebaseConfig = {
    apiKey: "AIzaSyBCU58AEq4iu_386XjpwENYdW_i9MPkVeg",
    authDomain: "transferir-textos.firebaseapp.com",
    databaseURL: "https://transferir-textos.firebaseio.com",
    projectId: "transferir-textos",
    storageBucket: "",
    messagingSenderId: "762477456987",
    appId: "1:762477456987:web:ae3a6f9156c119a0"
}

firebase.initializeApp(firebaseConfig)

var statusEnv = 0
var statusRec = 0

var numRand = ''

var naoEncontrado = true

var part2 = document.getElementById('part2')

function enviar() {
    document.getElementById('envRec').innerHTML = '<canvas id=\"canvas\" width=\"600px\" height\"400px\" style=\"border: 1px solid black;\"></canvas>'

    var canvas = document.getElementById('canvas')
    var larg, alt, posx, posy
    larg = 600
    alt = 400
    posx = (canvas.width - larg) / 2
    posy = (canvas.height - alt) / 2

    context = canvas.getContext("2d")

    var img = new Image()
    img.src = './img/_raven.gif'
    img.onload = function() {
        context.drawImage(img, 10, 10)
    }
    
}

function receber() {
    
}

function envTxt() {
    var msg = document.getElementById('msg').value

    if (msg == '') {
        alert('Insira alguma mensagem!!')
    } else {
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