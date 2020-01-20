const daniUSedmici = ["ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu", "nedjelju"];

function prikaziAlert(jePeriodicno, trazenoZauzece, zauzeceKojeSprjecava) {
    var poruka;
    if (jePeriodicno)
        poruka = "Nije moguće rezervisati salu " + trazenoZauzece.naziv + " periodično u " + daniUSedmici[trazenoZauzece.dan] + ", " + trazenoZauzece.semestar + " semestar, i termin od "
            + trazenoZauzece.pocetak + " do " + trazenoZauzece.kraj + "!. Sala je već zauzeta od strane " + zauzeceKojeSprjecava.predavac;
    else
        poruka = "Nije moguće rezervisati salu " + trazenoZauzece.naziv + " za navedeni datum " + trazenoZauzece.datum.dan + "/" + (trazenoZauzece.datum.mjesec + 1) + "/"
            + trazenoZauzece.datum.godina + " i termin od " + trazenoZauzece.pocetak + " do " + trazenoZauzece.kraj + "!. Sala je već zauzeta od strane " + zauzeceKojeSprjecava.predavac;

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

        xhttp.open("GET", "/zauzecaDB", true);
        xhttp.send();
    }

    function ucitajOsobljaImpl() {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                let osobljeJson = JSON.parse(xhttp.responseText);
                let osobljeForm = form.querySelector("#osobaSelect");
                let osobljeFormHtml = '';

                for (i in osobljeJson) {
                    var osoba = osobljeJson[i].uloga + " " + osobljeJson[i].ime + " " + osobljeJson[i].prezime;
                    osobljeFormHtml += "<option value='" + osoba + "'>" + osoba + "</option>";
                }

                osobljeForm.innerHTML = osobljeFormHtml;
            }
        };

        xhttp.open("GET", "/osoblje", true);
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
                    window.alert(prikaziAlert(false, vanredno, xhttp.response.zauzeceKojeSprjecava));

                var zauzeca = xhttp.response.svjezaZauzeca;
                if (zauzeca != null && zauzeca != undefined)

                    Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
            }
        }

        xhttp.open("POST", "/rezervisiVanrednoDB", true);
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
                    window.alert(prikaziAlert(true, periodicno, xhttp.response.zauzeceKojeSprjecava));


                var zauzeca = xhttp.response.svjezaZauzeca;
                if (zauzeca != null && zauzeca != undefined)
                    Kalendar.ucitajPodatke(zauzeca.periodicna, zauzeca.vanredna);
            }
        }

        xhttp.open("POST", "/rezervisiPeriodicnoDB", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify(periodicno));
    }

    function dohvatiSlikeImpl(indexPrveOdTrenutnih) {
        var xhttp = new XMLHttpRequest();

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


    function ucitajRezervacijeOsobaImpl() {

        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {

                if (xhttp.status == 200) {
                    let podaci = JSON.parse(xhttp.responseText);

                    var myTable = "<tr><th>Uloga</th><th>Ime</th><th>Prezime</th><th>Nalazi se u:</th></tr>";

                    for (let i = 0; i < podaci.length; i++) {
                        let x = podaci[i];
                        myTable += "<tr><td>" + x.uloga + "</td><td>" + x.ime + "</td><td>" + x.prezime + "</td><td>" + x.naziv + "</td></tr>";
                    }

                    document.getElementById("tabelaOsoba").innerHTML = myTable;
                }
                else if (xhttp.status == 400) {
                    document.getElementById("tabelaOsoba").innerHTML = "GREŠKA";
                }

            }
        };

        xhttp.open("GET", "/rezervacijeOsoba", true);
        xhttp.send();
    }


    return {
        ucitajZauzecaSaServera: ucitajZauzecaSaServeraImpl,
        ucitajOsoblja: ucitajOsobljaImpl,
        ucitajRezervacijeOsoba: ucitajRezervacijeOsobaImpl,
        rezervisiNovoVanrednoZauzece: rezervisiNovoVanrednoZauzeceImpl,
        rezervisiNovoPeriodicnoZauzece: rezervisiNovoPeriodicnoZauzeceImpl,
        dohvatiSlike: dohvatiSlikeImpl
    }
}());