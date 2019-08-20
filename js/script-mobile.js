function veriTamnhTela() {
    let w = window.innerWidth
    let h = window.innerHeight
    if (h > w) {
        //alert('Deite a tela para melhor visualização da aplicação!')
        document.querySelector('main').id = 'main-mobile'

        document.querySelector('main section#top').className = 'top-mobile'

        document.querySelector('main section#down').className = 'down-mobile'
    }
    else {
        document.querySelector('main').id = ''

        document.querySelector('main section#top').className = ''

        document.querySelector('main section#down').className = ''
    }
}
