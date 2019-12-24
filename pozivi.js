let Pozivi = (function() {   

    //function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {  }


    // ucitava podatke sa servera u modul Kalendar kad se otvori rezervacije.html
    function ucitajZauzecaSaServeraImpl(zauzeca) {
        var xhttp = new XMLHttpRequest();
        
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
        };

        xhttp.open("GET", zauzeca, true);
        xhttp.send();
    }
    
    return {    
        ucitajZauzecaSaServera: ucitajZauzecaSaServeraImpl
        //obojiZauzeca: obojiZauzecaImpl,        
        //ucitajPodatke: ucitajPodatkeImpl,        
        //iscrtajKalendar: iscrtajKalendarImpl    
    }
}());