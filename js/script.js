var firebaseConfig = {
    apiKey: "AIzaSyBCU58AEq4iu_386XjpwENYdW_i9MPkVeg",
    authDomain: "transferir-textos.firebaseapp.com",
    databaseURL: "https://transferir-textos.firebaseio.com",
    projectId: "transferir-textos",
    storageBucket: "",
    messagingSenderId: "762477456987",
    appId: "1:762477456987:web:ae3a6f9156c119a0"
};

firebase.initializeApp(firebaseConfig);

var statusEnv = 0
var statusRec = 0

var numRand = ''

var naoEncontrado = true

var part2 = document.getElementById('part2')

function abreFechEnviar() {
    if (statusEnv == 0) {
        if (statusRec == 1) {
            abreFechReceber()
        }
        statusEnv = 1
        part2.style.display = 'flex'
    } else {
        statusEnv = 0
        part2.style.display = 'none'
    }
}

function abreFechReceber() {
    if (statusRec == 0) {
        if (statusEnv == 1) {
            abreFechEnviar()
        }
        statusRec = 1
        part2.style.display = 'flex'

    } else {
        statusRec = 0
        part2.style.display = 'none'
    }
}

function enviar() {
    part2.innerHTML = "<textarea id=\"msg\"></textarea><button onclick=\"envTxt()\">Salvar</button>"
    abreFechEnviar()
}

function receber() {
    part2.innerHTML = "<input id=\"buscId\" type=\"text\"><button onclick=\"recTxt()\">Comfirmar</button><textarea id=\"msg\" readonly></textarea>"
    abreFechReceber()
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