let Kalendar = (function () {
    class Zauzece {
        constructor(pocetak, kraj, naziv, predavac) {
            this.pocetak = pocetak;
            this.kraj = kraj;
            this.naziv = naziv;
            this.predavac = predavac;
        }
    }

    class PeriodicnoZauzece {
        constructor(dan, semestar, pocetak, kraj, naziv, predavac) {
            Zauzece.call(this, pocetak, kraj, naziv, predavac);
            this.dan = dan;
            this.semestar = semestar;
        }
    }

    class VanrednoZauzece {
        constructor(datum, pocetak, kraj, naziv, predavac) {
            Zauzece.call(this, pocetak, kraj, naziv, predavac);
            this.datum = datum;
        }
    }

    let periodicnaZauzeca;
    let vanrednaZauzeca;

    function obojiZauzecaImpl(kalendarRef, mjesec, sala, pocetak, kraj) {
        //implementacija ide ovdje
    }

    function ucitajPodatkeImpl(periodicna, redovna) {
        console.log("dabogda krepo");
    }

    function iscrtajKalendarImpl(kalendarRef, mjesec) {
        //implementacija ide ovdje
    }

    function ispisiImpl() {
        console.log("HEHE MOFO");
    }

    return {
        obojiZauzeca: obojiZauzecaImpl,
        ucitajPodatke: ucitajPodatkeImpl,
        iscrtajKalendar: iscrtajKalendarImpl,
        ispisi: ispisiImpl
    }
}());