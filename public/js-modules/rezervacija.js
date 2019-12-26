Pozivi.ucitajZauzecaSaServera();

// Funkcija za rezervaciju sale, poziva se kada se klikne dan na kalendaru
window.onclick = event => {

    var kliknutiDan = parseInt(event.target.innerHTML);
    var trenutnaSala = salaField.value;
    var trenutniPocetak = pocetakField.value;
    var trenutniKraj = krajField.value;

    if (!isFinite(kliknutiDan) || kliknutiDan < 1 || kliknutiDan > 31 
    || ![0, 1, 2, 3, 4, 5, 9, 10, 11].includes(Kalendar.trenutniMjesec()) 
    || !trenutniPocetak.length > 0 || !trenutniKraj.length > 0 || document.getElementById("err").innerHTML.length > 0)
        return;
                
    var trenutniDatum = new Date();

    console.log(trenutniKraj.substring(0, 2) + ":" + trenutniKraj.substring(3));
    var izabraniDatum = new Date(trenutniDatum.getFullYear(), Kalendar.trenutniMjesec(), kliknutiDan,
        trenutniPocetak.substring(0, 2), trenutniPocetak.substring(3));

    if (izabraniDatum.getTime() <= trenutniDatum.getTime()) {
        alert("Nema smisla rezervisati nešto što je već prošlo...");
        return;
    }

    var dan = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(" + kliknutiDan + ")");;
    if (window.getComputedStyle(dan, null).getPropertyValue("background-color") === "rgb(253, 98, 74)"){
        alert("Izabrana sala je već rezervisana u tom periodu!");
        return;
    } 

    var daniUSedmici = ["ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu", "nedjelju"];
    semestarZauzeca = (Kalendar.trenutniMjesec() >= 1 && Kalendar.trenutniMjesec() <= 5) ? "ljetni" : "zimski";
    var datumZauzeca = {dan : kliknutiDan, mjesec: Kalendar.trenutniMjesec(), godina: new Date().getFullYear()};

    var odstupanje = parseInt(document.getElementById("kalendar").querySelector(".dani").firstElementChild.style.gridColumnStart) - 1;

    kliknutiDan = (kliknutiDan % 7) + odstupanje - 1;
    if (kliknutiDan === -1)
        kliknutiDan = 6;

    if (kliknutiDan >= odstupanje)
        kliknutiDan = (kliknutiDan % 7);

    var periodicno = document.querySelector('input[name=periodicno').checked;

    var poruka;
    if (periodicno)
        poruka = "Rezervacija sale " + trenutnaSala + " periodično u " + daniUSedmici[kliknutiDan] + ", " + semestarZauzeca + " semestar, u periodu od " + trenutniPocetak + " do " + trenutniKraj + ".\nPritisnite 'OK' za potvrdu";
    else
        poruka = "Rezervacija sale " + trenutnaSala + " na datum " + datumZauzeca.dan + "." + datumZauzeca.mjesec + "." + datumZauzeca.godina + " u periodu od " + trenutniPocetak + " do " + trenutniKraj + ".\nPritisnite 'OK' za potvrdu";

    if (!confirm(poruka))
        return;

    if (periodicno) {
        periodicnoZauzece = { dan: kliknutiDan, semestar: semestarZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: "Nebitno" };
        //rezervisiPeriodicno(periodicnoZauzece);
    }
    else {
        console.log("USLO 1 :" + kliknutiDan);
            
        vanrednoZauzece = { datum: datumZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: "Nebitno" };
        console.log(vanrednoZauzece);
        Pozivi.rezervisiNovoVanrednoZauzece(vanrednoZauzece);
    }
}