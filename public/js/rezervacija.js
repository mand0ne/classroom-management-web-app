Pozivi.ucitajZauzecaSaServera();

window.onclick = event => {

    var kliknutiDan = parseInt(event.target.innerHTML);
    var trenutnaSala = salaField.value;
    var trenutniPocetak = pocetakField.value;
    var trenutniKraj = krajField.value;

    if (event.target.tagName === "OPTION" || !isFinite(kliknutiDan) || kliknutiDan < 1 || kliknutiDan > 31 
    || !trenutniPocetak.length > 0 || !trenutniKraj.length > 0 || document.getElementById("err").innerHTML.length > 0)
        return;
    
    var periodicno = document.querySelector('input[name=periodicno').checked;
    if(periodicno && ![0, 1, 2, 3, 4, 5, 9, 10, 11].includes(Kalendar.trenutniMjesec()))
        return;
    
    var semestarZauzeca = (Kalendar.trenutniMjesec() >= 1 && Kalendar.trenutniMjesec() <= 5) ? "ljetni" : "zimski";

    var izabraniDatum = new Date(new Date().getFullYear(), Kalendar.trenutniMjesec(), kliknutiDan,
        trenutniPocetak.substring(0, 2), trenutniPocetak.substring(3));

    if (izabraniDatum.getTime() <= new Date().getTime()) {
        alert("Nema smisla rezervisati nešto što je već prošlo...");
        return;
    }

    var dan = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(" + kliknutiDan + ")");;
    if (window.getComputedStyle(dan, null).getPropertyValue("background-color") === "rgb(253, 98, 74)"){
        alert("Izabrana sala je već rezervisana u tom periodu!");
        return;
    } 

    var daniUSedmici = ["ponedjeljak", "utorak", "srijedu", "četvrtak", "petak", "subotu", "nedjelju"];
    var datumZauzeca = {dan : kliknutiDan, mjesec: Kalendar.trenutniMjesec(), godina: new Date().getFullYear()};

    var kliknutiDan = (new Date(new Date().getFullYear(), 11, 30).getDay() + 6) % 7;

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
        vanrednoZauzece = { datum: datumZauzeca, pocetak: trenutniPocetak, kraj: trenutniKraj, naziv: trenutnaSala, predavac: "Nebitno" };
        console.log("VANREDNO 1: " + JSON.stringify(vanrednoZauzece) + "\n");
        Pozivi.rezervisiNovoVanrednoZauzece(vanrednoZauzece);
    }
}