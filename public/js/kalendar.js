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
        const regex = /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/;

        if (kalendarRef == null || kalendarRef == undefined || mjesec < 0 || mjesec > 11 || sala == null || sala == undefined
            || !regex.test(pocetak) || !regex.test(kraj))
            return;

        var dani = kalendarRef.querySelector(".dani").children;

        if (pocetak == '' || kraj == '') {
            for (let i = 0; i < dani.length; i++)
                dani[i].className = '';

            return;
        }

        document.getElementById("err").innerHTML = '';

        if (parseInt(pocetak.replace(':', '')) >= parseInt(kraj.replace(':', ''))){
            document.getElementById("err").innerHTML = "Kraj mora biti kasnije od početka!"
            return;    
        }

        for (let i = 0; i < dani.length; i++)
            dani[i].className = 'slobodna';

        var pocetakInt = parseInt(pocetak.replace(':', ''));
        var krajInt = parseInt(kraj.replace(':', ''));

        // Zimski - 9 10 11 0
        // Ljetni - 1 2 3 4 5

        _vanrednaZauzeca.forEach((vz) => {
            var vzPocetakInt = parseInt(vz.pocetak.replace(':', ''));
            var vzKrajInt = parseInt(vz.kraj.replace(':', ''));


            if (vz.datum.getMonth() == mjesec && vz.datum.getFullYear() == new Date().getFullYear() && vz.naziv == sala
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
        for(let i = 0; i < vanredna.length; i++){
            var vzDatum = vanredna[i].datum;
            vanredna[i].datum = new Date(vzDatum.godina, vzDatum.mjesec, vzDatum.dan);
        }

        _periodicnaZauzeca = periodicna;
        _vanrednaZauzeca = vanredna;

        Kalendar.obojiZauzeca(_kalendarRef, _trenutniMjesec, salaField.value, pocetakField.value, krajField.value);
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
            dan.appendChild(document.createTextNode(i));
            dani.appendChild(dan);
        }

        dani.firstElementChild.style.gridColumnStart = datum.getDay() == 0 ? 7 : datum.getDay();

        obojiZauzecaImpl(kalendarRef, _trenutniMjesec, document.getElementsByClassName('lbin')[0].lastElementChild.value,
            document.querySelector('input[name=pocetak').value, document.querySelector('input[name=kraj').value)
    }

    function getTrenutniMjesecImpl() {
        return _trenutniMjesec;
    }

    function setTrenutniMjesecImpl(mjesec) {
        _trenutniMjesec = mjesec;
        iscrtajKalendarImpl(_kalendarRef, mjesec);
    }

    return {
        ucitajPodatke: ucitajPodatkeImpl,
        obojiZauzeca: obojiZauzecaImpl,
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

Kalendar.iscrtajKalendar(_kalendarRef, new Date().getMonth());