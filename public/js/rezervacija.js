Pozivi.ucitajZauzecaSaServera();

window.onclick = event => {

    var kliknutiDan = parseInt(event.target.innerHTML);
    var trenutnaSala = salaField.value;
    var trenutniPocetak = pocetakField.value;
    var trenutniKraj = krajField.value;

    // Ispitivanje trivijalnih slučajeva za koje nema smisla slati POST 
    if (event.target.tagName === "OPTION" || !isFinite(kliknutiDan) || kliknutiDan < 1 || kliknutiDan > 31
        || !trenutniPocetak.length > 0 || !trenutniKraj.length > 0 || document.getElementById("err").innerHTML.length > 0)
        return;

    // Da li je mjesec uopste za vrijeme akademske godine?
    // Za periodicno nema smisla da ne bude, za vanredno moze
    var periodicno = document.querySelector('input[name=periodicno').checked;
    if (periodicno && ![0, 1, 2, 3, 4, 5, 9, 10, 11].includes(Kalendar.trenutniMjesec())){
        alert("Periodicno zauzece mora biti tokom akademske godine!");
        return;
    }

    var semestarZauzeca = (Kalendar.trenutniMjesec() >= 1 && Kalendar.trenutniMjesec() <= 5) ? "ljetni" : "zimski";
    var izabraniDatum = new Date(new Date().getFullYear(), Kalendar.trenutniMjesec(), kliknutiDan,
        trenutniPocetak.substring(0, 2), trenutniPocetak.substring(3));

    // KO HOCE NEK UKLJUCI I OVU VALIDACIJU
    // Uzmi trenutni datum i provjeri da li je uneseni datum vec prosao
    /* UNIX epoch komparacija
    if (izabraniDatum.getTime() <= new Date().getTime()) {
        alert("Nema smisla rezervisati nešto što je već prošlo...");
        return;
    }*/

    // Ako je izabrani datum vec crven na kalendaru, nema smisla slati POST
    // ALI, posalji GET da se dobave najnoviji podaci za ubuduce
    var dan = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(" + kliknutiDan + ")");;
    if (window.getComputedStyle(dan, null).getPropertyValue("background-color") === "rgb(253, 98, 74)") {
        Pozivi.ucitajZauzecaSaServera();
        alert("Izabrana sala je već zauzeta u tom periodu!");
        return;
    }

    var datumZauzeca = { dan: kliknutiDan, mjesec: Kalendar.trenutniMjesec(), godina: new Date().getFullYear() };
    var kliknutiDan = (new Date(datumZauzeca.godina, datumZauzeca.mjesec, kliknutiDan).getDay() + 6) % 7;

    var poruka;

    if (periodicno)
        poruka = "Rezervacija sale " + trenutnaSala + " periodično u " + daniUSedmici[kliknutiDan] + ", " + semestarZauzeca + " semestar, u periodu od " + trenutniPocetak + " do " + trenutniKraj + ".\nPritisnite 'OK' za potvrdu";
    else
        poruka = "Rezervacija sale " + trenutnaSala + " na datum " + datumZauzeca.dan + "." + (datumZauzeca.mjesec + 1) + "." + datumZauzeca.godina + " u periodu od " + trenutniPocetak + " do " + trenutniKraj + ".\nPritisnite 'OK' za potvrdu";

    if (!confirm(poruka))
        return;

    if (periodicno) {
        periodicnoZauzece = { dan: kliknutiDan, semestar: semestarZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: "Nebitno" };
        Pozivi.rezervisiNovoPeriodicnoZauzece(periodicnoZauzece);
    }
    else {
        vanrednoZauzece = { datum: datumZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: "Nebitno" };
        Pozivi.rezervisiNovoVanrednoZauzece(vanrednoZauzece);
    }
}