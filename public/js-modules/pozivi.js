let Pozivi = (function() {   

    //function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {  }


    // ucitava podatke sa servera u modul Kalendar kad se otvori rezervacije.html
    function ucitajZauzecaSaServeraImpl() {
        console.log("POZVANO");
        var xhttp = new XMLHttpRequest();
        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
        };

        xhttp.open("GET", "/zauzecaJSON", true);
        xhttp.send();
    }
    
    function rezervisiNovoVanrednoZauzeceImpl(vanredno) {
        var ajax = new XMLHttpRequest();
        
        ajax.onreadystatechange = function() {// Anonimna funkcija
            if (ajax.readyState == 4 && ajax.status == 200){
                console.log("AJAX RESPONSE TEXT JARA: \n" + ajax.responseText);

            }
        }
        ajax.open("POST","/rezervisiVanredno",true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(vanredno));
    }

    return {    
        ucitajZauzecaSaServera: ucitajZauzecaSaServeraImpl,
        rezervisiNovoVanrednoZauzece: rezervisiNovoVanrednoZauzeceImpl
        //obojiZauzeca: obojiZauzecaImpl,        
        //ucitajPodatke: ucitajPodatkeImpl,        
        //iscrtajKalendar: iscrtajKalendarImpl    
    }
}());