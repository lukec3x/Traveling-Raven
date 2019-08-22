function veriTamnhTela() {
    let w = window.innerWidth
    let h = window.innerHeight
    //if (h > w) {
    if (WURFL.is_mobile === true && WURFL.form_factor === "Smartphone") {
        //alert('Deite a tela para melhor visualização da aplicação!')
        document.querySelector('main').id = 'main-mobile'

        try {
            document.querySelector('main section#top').className = 'top-mobile'
            document.querySelector('main section#down').className = 'down-mobile'
        } catch (error) {console.log(error)}
    }
    else {
        document.querySelector('main').id = ''

        try {
            document.querySelector('main section#top').className = ''
            document.querySelector('main section#down').className = ''
        } catch (error) {console.log(error)}
    }
}
