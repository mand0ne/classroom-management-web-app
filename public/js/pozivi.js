const daniUSedmici = ["ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu", "nedjelju"];

function prikaziAlert(periodicno, zauzece) {
    var poruka;
    if (periodicno)
        poruka = "Nije moguće rezervisati salu " + zauzece.naziv + " periodično u " + daniUSedmici[zauzece.dan] + ", " + zauzece.semestar + " semestar, i termin od " + zauzece.pocetak + " do " + zauzece.kraj + "!. Sala je već zauzeta!";
    else
        poruka = "Nije moguće rezervisati salu " + zauzece.naziv + " za navedeni datum " + zauzece.datum.dan + "/" + (zauzece.datum.mjesec + 1) + "/" + zauzece.datum.godina + " i termin od " + zauzece.pocetak + " do " + zauzece.kraj + "!. Sala je već zauzeta!";

    return poruka;
}

function podesiDugme(dugme, disable) {
    if (!dugme)
        return;

    if (disable) {
        dugme.disabled = true;
        dugme.style.color = "gray";
    }
    else {
        dugme.disabled = false;
        dugme.style.color = "white";
    }
}

let Pozivi = (function () {

    function ucitajZauzecaSaServeraImpl() {
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
                if (xhttp.status == 400) {
                    window.alert(xhttp.response);
                    return;
                }

                if (xhttp.status == 403)
                    window.alert(prikaziAlert(false, vanredno));

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
                if (xhttp.status == 400) {
                    window.alert(xhttp.response);
                    return;
                }

                if (xhttp.status == 403)
                    window.alert(prikaziAlert(true, periodicno));

                var zauzeca = xhttp.response;
                Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
            }
        }

        xhttp.open("POST", "/rezervisiPeriodicno", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(periodicno));
    }

    function dohvatiSlikeImpl(indexPrveOdTrenutnih) {
        var xhttp;
        xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    podesiDugme(document.getElementById("sljed"), false);
                    azurirajSlike(xhttp.responseText);
                }
                else if (xhttp.status == 202) {
                    podesiDugme(document.getElementById("sljed"), true);
                    azurirajSlike(xhttp.responseText);
                }
            }
        };

        xhttp.open("GET", "/images?trenutna=" + encodeURIComponent(indexPrveOdTrenutnih), true);
        xhttp.send();
    }

    return {
        ucitajZauzecaSaServera: ucitajZauzecaSaServeraImpl,
        rezervisiNovoVanrednoZauzece: rezervisiNovoVanrednoZauzeceImpl,
        rezervisiNovoPeriodicnoZauzece: rezervisiNovoPeriodicnoZauzeceImpl,
        dohvatiSlike: dohvatiSlikeImpl
    }
}());