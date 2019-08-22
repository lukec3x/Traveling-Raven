function veriTamnhTela() {
    let w = window.innerWidth
    let h = window.innerHeight
    //if (h > w) {
    if (WURFL.is_mobile === true && WURFL.form_factor === "Smartphone") {

        // body
        document.querySelector('body').setAttribute('id', 'page-2')

        // main
        document.querySelector('main').setAttribute('id', 'main-mobile-2')

        // #voltar
        try {
            document.querySelector('a#voltarSemPositionAbsl').setAttribute('id', 'voltar')
        } catch (e) {}
        try {
            document.querySelector('body#page-2 main#main-mobile-2 a#voltarSemPositionAbsl').setAttribute('id', 'voltar')
        } catch (e) {}
        try {
            document.getElementById('voltar').setAttribute('id', 'voltarSemTop')
        } catch (error) {
            
        }

    } else {
        // body
        if (document.getElementById('ravenToLeft') == null) {
            document.querySelector('body').setAttribute('id', '')
        }
        if (document.getElementById('ravenToRight') == null) {
            document.querySelector('body').setAttribute('id', '')
        }

        // main
        document.querySelector('main').setAttribute('id', 'envRec')

        // #voltar        
        try {
            document.querySelector('a#voltar').setAttribute('id', 'voltarSemPositionAbsl')
        } catch (e) {}
        try {
            if (document.querySelector('body').id == 'page-2')
                document.querySelector('a#voltarSemPositionAbsl').setAttribute('id', 'voltar')
        } catch (e) {}
        try {
            document.getElementById('voltarSemTop').setAttribute('id', 'voltar')
        } catch (error) {
            
        }

    }
}