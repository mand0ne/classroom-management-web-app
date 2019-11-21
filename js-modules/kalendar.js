let _kalendarRef = document.getElementById('kalendar');
var dugmad = document.getElementsByClassName('dugmad')[0].children;
var form = document.querySelector(".sadrzaj").firstElementChild;
var pocetakField = form.querySelector('input[name=pocetak');
var krajField = form.querySelector('input[name=kraj');
var salaField = form.querySelector("select");

function PeriodicnoZauzece(dan, semestar, pocetak, kraj, naziv, predavac) {
    this.dan = dan;
    this.semestar = semestar;
    this.pocetak = pocetak;
    this.kraj = kraj;
    this.naziv = naziv;
    this.predavac = predavac;
}

function VanrednoZauzece(datum, pocetak, kraj, naziv, predavac) {
    this.datum = datum;
    this.pocetak = pocetak;
    this.kraj = kraj;
    this.naziv = naziv;
    this.predavac = predavac;
}

let Kalendar = (function () {

    var _periodicnaZauzeca = [];
    var _vanrednaZauzeca = [];
    var _trenutniMjesec = new Date().getMonth();
    const _months = ["Januar", "Februar", "Mart", "April", "Maj", "Juni", "Juli", "August", "Septembar", "Oktobar", "Novembar", "Decembar"];

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {
        var dani = kalendarRef.querySelector(".dani").children;

        if (pocetak == '' || kraj == '' || _vanrednaZauzeca.length == 0 && _periodicnaZauzeca.length == 0) {
            for (let i = 0; i < dani.length; i++)
                dani[i].className = '';

            return;
        }

        if (parseInt(pocetak.replace(':', '')) >= parseInt(kraj.replace(':', '')))
            document.getElementById("err").innerHTML = "Kraj mora biti kasnije od početka!"
        else
            document.getElementById("err").innerHTML = '';

        var dani = kalendarRef.querySelector(".dani").children;

        for (let i = 0; i < dani.length; i++)
            dani[i].className = 'slobodna';

        var pocetakInt = parseInt(pocetak.replace(':', ''));
        var krajInt = parseInt(kraj.replace(':', ''));

        // Zimski - 9 10 11 0
        // Ljetni - 1 2 3 4 5

        _vanrednaZauzeca.forEach((vz) => {
            var vzPocetakInt = parseInt(vz.pocetak.replace(':', ''));
            var vzKrajInt = parseInt(vz.kraj.replace(':', ''));

            if (vz.datum.getMonth() == mjesec && vz.datum.getFullYear == new Date().getFullYear && vz.naziv == sala
                && Math.max(pocetakInt, vzPocetakInt) < Math.min(krajInt, vzKrajInt))
                dani[vz.datum.getDate() - 1].className = 'zauzeta';
        });

        _periodicnaZauzeca.forEach((vz) => {
            var vzPocetakInt = parseInt(vz.pocetak.replace(':', ''));
            var vzKrajInt = parseInt(vz.kraj.replace(':', ''));
            var odstupanje = parseInt(kalendarRef.querySelector(".dani").firstElementChild.style.gridColumnStart) - 1; // kad pocinje prvi dan?

            if (vz.semestar == dajSemestar(mjesec) && vz.naziv == sala
                && Math.max(pocetakInt, vzPocetakInt) < Math.min(krajInt, vzKrajInt)) {
                var i;
                if (vz.dan >= odstupanje)
                    i = vz.dan - odstupanje;
                else
                    i = 7 - odstupanje + vz.dan;

                for (; i < dani.length; i += 7)
                    dani[i].className = 'zauzeta';
            }
        });
    }

    function dajSemestar(mjesec) {
        if (mjesec >= 9 && mjesec <= 11 || mjesec == 0)
            return 'zimski'
        else if (mjesec >= 1 && mjesec <= 5)
            return 'ljetni'
    }

    function ucitajPodatkeImpl(periodicna, vanredna) {

        // hArDkOdIrAnA lIstA zAuZeCa ...
        if (periodicna == undefined) {
            _periodicnaZauzeca.push(new PeriodicnoZauzece(1, "zimski", "15:00", "18:00", "0-03", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(0, "zimski", "12:00", "15:00", "0-05", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(1, 'zimski', "20:00", "22:00", "1-01", "ZJ"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(6, "zimski", "21:00", "23:00", "1-04", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(5, "zimski", "21:00", "22:00", "A3", "Nebitno"));


            _periodicnaZauzeca.push(new PeriodicnoZauzece(6, "ljetni", "14:30", "15:30", "0-01", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(3, "ljetni", "16:00", "18:30", "0-01", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(4, "ljetni", "12:40", "14:40", "0-02", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(2, "ljetni", "21:10", "22:10", "1-03", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(2, "ljetni", "20:30", "21:45", "EE2", "Nebitno"));
            _periodicnaZauzeca.push(new PeriodicnoZauzece(3, "ljetni", "09:00", "13:00", "A1", "Nebitno"));
        }
        else
            _periodicnaZauzeca = periodicna;

        if (vanredna == undefined) {
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 0, 8), "12:45", "16:30", "EE1", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 9, 21), "17:00", "17:45", "A2", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 10, 1), "13:00", "15:00", "1-01", "NN"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 10, 29), "16:00", "17:00", "1-01", "VO"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 11, 31), "16:00", "18:00", "1-02", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 11, 3), "16:00", "18:00", "1-04", "VO"));

            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 1, 16), "18:30", "19:05", "A3", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 1, 6), "15:30", "18:00", "A3", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 1, 17), "08:00", "10:00", "0-01", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 2, 31), "20:00", "22:00", "1-02", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 3, 4), "10:00", "12:00", "0-03", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 4, 8), "09:00", "11:00", "1-03", "Nebitno"));
            _vanrednaZauzeca.push(new VanrednoZauzece(new Date(2019, 5, 8), "12:00", "14:00", "0-05", "Nebitno"));
        }
        else
            _vanrednaZauzeca = vanredna;

    }

    function dodajZauzece(novoZauzece) {
        if (novoZauzece instanceof PeriodicnoZauzece)
            _periodicnaZauzeca.push(novoZauzece);
        else if (novoZauzece instanceof VanrednoZauzece)
            _vanrednaZauzeca.push(novoZauzece);
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

    function iscrtajKalendarImpl(kalendarRef, mjesec) {
        _trenutniMjesec = mjesec % 12;

        if (_trenutniMjesec == 0)
            podesiDugme(kalendarRef.querySelector("#pret"), true);
        else
            podesiDugme(kalendarRef.querySelector("#pret"), false);

        if (_trenutniMjesec == 11)
            podesiDugme(kalendarRef.querySelector("#sljed"), true);
        else
            podesiDugme(kalendarRef.querySelector("#sljed"), false);

        var datum = new Date(new Date().getFullYear(), _trenutniMjesec, 1);
        kalendarRef.firstElementChild.innerHTML = _months[datum.getMonth()];

        var dani = kalendarRef.querySelector(".dani");
        var brojDana = new Date(datum.getFullYear(), _trenutniMjesec + 1, 0).getDate();

        dani.innerHTML = "";
        for (let i = 1; i <= brojDana; i++) {
            var dan = document.createElement("div");
            var node = document.createTextNode(i);
            dan.appendChild(node);
            dani.appendChild(dan);
        }

        dani.firstElementChild.style.gridColumnStart = datum.getDay() == 0 ? 7 : datum.getDay();

        obojiZauzecaImpl(kalendarRef, _trenutniMjesec, document.getElementsByClassName('lbin')[0].lastElementChild.value, document.querySelector('input[name=pocetak').value, document.querySelector('input[name=kraj').value)
    }

    function getTrenutniMjesecImpl() {
        return _trenutniMjesec;
    }

    function setTrenutniMjesecImpl(mjesec) {
        _trenutniMjesec = mjesec;
        iscrtajKalendarImpl(_kalendarRef, mjesec);
    }

    return {
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
        trenutniMjesec: getTrenutniMjesecImpl,
        setTrenutniMjesec: setTrenutniMjesecImpl,
        dodajZauzece: dodajZauzece,
    }
}());


// Listeneri, nakon sto se sve inicijaliziralo

dugmad[0].onclick = function () { Kalendar.iscrtajKalendar(_kalendarRef, Kalendar.trenutniMjesec() - 1); }
dugmad[1].onclick = function () { Kalendar.iscrtajKalendar(_kalendarRef, Kalendar.trenutniMjesec() + 1); }

pocetakField.onchange = function () { Kalendar.obojiZauzeca(_kalendarRef, Kalendar.trenutniMjesec(), salaField.value, pocetakField.value, krajField.value) }
krajField.onchange = function () { Kalendar.obojiZauzeca(_kalendarRef, Kalendar.trenutniMjesec(), salaField.value, pocetakField.value, krajField.value) }
salaField.onchange = function () { Kalendar.obojiZauzeca(_kalendarRef, Kalendar.trenutniMjesec(), salaField.value, pocetakField.value, krajField.value) }

if (document.getElementsByClassName("meni").length > 0)
    Kalendar.ucitajPodatke();

Kalendar.iscrtajKalendar(_kalendarRef, new Date().getMonth());