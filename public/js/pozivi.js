let Pozivi = (function () {

    function ucitajZauzecaSaServeraImpl() {
        console.log("POZVANO");
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                zauzecaJson = JSON.parse(xhttp.responseText);
                Kalendar.ucitajPodatke(zauzecaJson.periodicna, zauzecaJson.vanredna);
            }
        };

        xhttp.open("GET", "/zauzecaJSON", true);
        xhttp.send();
    }

    function rezervisiNovoVanrednoZauzeceImpl(vanredno) {
        var xhttp = new XMLHttpRequest();

        xhttp.responseType = "json";    // iz index.js vracamo JSON
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 400){
                    window.alert(xhttp.response);
                    return;
                }
                
                if (xhttp.status == 403)
                    window.alert("Rezervaciju nije moguce spasiti. Postoji preklapanje.");

                var zauzeca = xhttp.response;
                Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
            }
        }

        xhttp.open("POST", "/rezervisiVanredno", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(vanredno));
    }

    function rezervisiNovoPeriodicnoZauzeceImpl(periodicno) {
        var xhttp = new XMLHttpRequest();

        xhttp.responseType = "json";    // iz index.js vracamo JSON
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 400){
                    window.alert(xhttp.response);
                    return;
                }
                
                if (xhttp.status == 403)
                    window.alert("Rezervaciju nije moguce spasiti. Postoji preklapanje.");

                var zauzeca = xhttp.response;
                Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
            }
        }

        xhttp.open("POST", "/rezervisiPeriodicno", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(periodicno));
    }

    return {
        ucitajZauzecaSaServera: ucitajZauzecaSaServeraImpl,
        rezervisiNovoVanrednoZauzece: rezervisiNovoVanrednoZauzeceImpl,
        rezervisiNovoPeriodicnoZauzece: rezervisiNovoPeriodicnoZauzeceImpl
        //obojiZauzeca: obojiZauzecaImpl,        
        //ucitajPodatke: ucitajPodatkeImpl,        
        //iscrtajKalendar: iscrtajKalendarImpl    
    }
}());