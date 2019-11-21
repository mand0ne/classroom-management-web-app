let assert = chai.assert;
let expect = chai.expect;

describe('Kalendar', function () {
    describe('obojiZauzeca', function () {
        it('Nije nista obojeno jer nije nista ucitano', function () {
            pocetakField.value = "15:00";
            krajField.value = "20:00";
            salaField.value = "1-01";

            var dani = _kalendarRef.querySelector(".dani").children;
            var nemaObojenih = true;

            for (let i = 0; i < dani.length; i++)
                if (dani[i].className != '') {
                    console.log(dani[i]);
                    nemaObojenih = false;
                    break;
                }

            expect(nemaObojenih, "Ipak ima obojenih a ne bi trebalo").to.be.true;
        });

        it('Dupla vrijednost obojena', function () {
            Kalendar.ucitajPodatke();
            Kalendar.dodajZauzece(new VanrednoZauzece(new Date(2019, 10, 29), "16:00", "17:00", "1-01", "NOVI"));

            pocetakField.value = "15:00";
            krajField.value = "20:00";
            salaField.value = "1-01";
            salaField.onchange();       // ovo ce pozvat bojenje...

            var dan = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(29)");
            assert.equal(dan.className, 'zauzeta', "Trebalo se obojiti a nije!")

        });

        it('Periodicno zauzece drugi semestar', function () {
            Kalendar.ucitajPodatke();
            // Postoji PeriodicnoZauzece(0, "zimski", "12:00", "15:00", "0-05", "Nebitno");
            // Testirajmo da li je ovo obojeno za recimo mjesec Mart

            pocetakField.value = "12:00";
            krajField.value = "16:00";
            salaField.value = "0-05";
            Kalendar.setTrenutniMjesec(2);       // ovo ce pozvat bojenje...

            // uzmimo 14 dan recimo, KOJI JE PONEDJELJAK, on ne bi trebao biti obojen u Martu dok u Januaru jeste (kao periodican)!
            var dan = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(14)");
            assert.equal(dan.className, 'slobodna', "Treba biti slobodna!")
        });

        it('Vanredno zauzece drugi mjesec', function () {
            Kalendar.ucitajPodatke();
            // Postoji VanrednoZauzece(new Date(2019, 1, 6), "18:30", "19:05", "A3", "Nebitno");
            // Testirajmo da li je ovo obojeno za recimo mjesec Maj

            pocetakField.value = "18:30";
            krajField.value = "19:05";
            salaField.value = "A3";
            Kalendar.setTrenutniMjesec(4);       // ovo ce pozvat bojenje...


            var dan = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(6)");
            assert.equal(dan.className, 'slobodna', "Treba biti slobodna!")
        });

        it('Svi popunjeni', function () {
            Kalendar.ucitajPodatke();
            // Postoji VanrednoZauzece(new Date(2019, 1, 6), "18:30", "19:05", "A3", "Nebitno");
            // Testirajmo da li je ovo obojeno za recimo mjesec Maj

            Kalendar.dodajZauzece(new PeriodicnoZauzece(0, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));
            Kalendar.dodajZauzece(new PeriodicnoZauzece(1, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));
            Kalendar.dodajZauzece(new PeriodicnoZauzece(2, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));
            Kalendar.dodajZauzece(new PeriodicnoZauzece(3, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));
            Kalendar.dodajZauzece(new PeriodicnoZauzece(4, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));
            Kalendar.dodajZauzece(new PeriodicnoZauzece(5, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));
            Kalendar.dodajZauzece(new PeriodicnoZauzece(6, "ljetni", "08:00", "12:30", "0-04", "Nebitno"));

            pocetakField.value = "10:00";
            krajField.value = "13:00";
            salaField.value = "0-04";
            Kalendar.setTrenutniMjesec(4);       // ovo ce pozvat bojenje...

            var dani = _kalendarRef.querySelector(".dani").children;
            var sviObojeni = true;

            for (let i = 0; i < dani.length; i++)
                if (dani[i].className == '') {
                    sviObojeni = true;
                    break;
                }

            assert.equal(sviObojeni, true, "Trebaju svi biti zauzeti!")
        });

        it('Dva uzastopna', function () {
            Kalendar.ucitajPodatke();

            pocetakField.value = "12:00";
            krajField.value = "19:00";
            salaField.value = "1-01";
            Kalendar.setTrenutniMjesec(10);       // ovo ce pozvat bojenje...

            var dani = _kalendarRef.querySelector(".dani").children;
            // Treba se obojiti 1 i 29

            var dan1 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(1)").className;
            var dan2 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(29)").className;

            Kalendar.setTrenutniMjesec(10);

            var dan3 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(1)").className;
            var dan4 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(29)").className;

            assert.isTrue(dan1 === dan3 && dan2 === dan4, "Trebaju biti obojeno 1 i 29!");
        });

        it('Drugaciji podaci', function () {
            Kalendar.ucitajPodatke();

            pocetakField.value = "17:00";
            krajField.value = "22:00";
            salaField.value = "1-04";
            Kalendar.setTrenutniMjesec(11);       // ovo ce pozvat bojenje...

            var dani = _kalendarRef.querySelector(".dani").children;
            // Zauzeti su, između ostalog, 15 dan u decembru koji je nedjelja (periodicno) i 3 dan koji je utorak

            var dan1 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(3)").className; // zauzeta
            var dan2 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(15)").className;    // zauzeta

            console.log(dan1);
            console.log(dan2);
            var noviPodaci = [];
            noviPodaci.push(new VanrednoZauzece(new Date(2019, 11, 22), "08:00", "10:00", "1-04", "VO"));
            Kalendar.ucitajPodatke([], noviPodaci);

            Kalendar.setTrenutniMjesec(11);       // ovo ce pozvat bojenje...

            var dan3 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(3)").className; // slobodna
            var dan4 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(15)").className;    // slobodna

            assert.isTrue(dan1 === 'zauzeta' && dan2 === 'zauzeta' && dan3 === 'slobodna' && dan4 === 'slobodna', "Trebaju biti sad slobodna 1 i 15!");
        });

        it('Dodatni 1: Periodicna obojenja', function () {
            Kalendar.ucitajPodatke();

            pocetakField.value = "20:00";
            krajField.value = "22:00";
            salaField.value = "EE2";
            Kalendar.setTrenutniMjesec(3);       // ovo ce pozvat bojenje... April mjesec

            // Za ovaj input imamo srijedom, pocevsi od 3 dana do 24 periodicna obojenja
            // tj. 3, 10, 17, 24

            var dani = _kalendarRef.querySelector(".dani").children;
            // Zauzeti su, između ostalog, 15 dan u decembru koji je nedjelja (periodicno) i 3 dan koji je utorak

            var dan1 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(3)").className;     // zauzeta
            var dan2 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(10)").className;   // zauzeta
            var dan3 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(17)").className;   // zauzeta
            var dan4 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(24)").className;   // zauzeta


            assert.isTrue(dan1 === 'zauzeta' && dan2 === 'zauzeta' && dan3 === 'zauzeta' && dan4 === 'zauzeta', "Trebaju biti zauzeto periodicno pocevsi od 3!");
        });

        it('Dodatni 2: Vanredna obojenja', function () {
            Kalendar.ucitajPodatke();

            // Testiranja kada trazeni termin obuhvata u potpunosti neka vec rezervisana

            pocetakField.value = "15:00";
            krajField.value = "20:00";
            salaField.value = "A3";
            Kalendar.setTrenutniMjesec(1);       // ovo ce pozvat bojenje...

            // Trebaju se obojit 6 i 16 u Februaru jer su unutar ovog termina oba

            var dani = _kalendarRef.querySelector(".dani").children;

            var dan1 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(6)").className;     // zauzeta
            var dan2 = _kalendarRef.querySelector(".dani").querySelector("div:nth-child(16)").className;   // zauzeta


            assert.isTrue(dan1 === 'zauzeta' && dan2 === 'zauzeta', "Trebaju biti zauzeto 6 i 16!");
        });
    });

    describe('iscrtajKalendar', function () {
        it('April ima 30 dana', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 3);
            var dani = _kalendarRef.querySelector(".dani");
            var brojDana = dani.childElementCount;
            assert.equal(brojDana, 30, "Neispravan broj dana! - Treba 30");
        });

        it('August ima 31 dan', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 7);
            var dani = _kalendarRef.querySelector(".dani");
            var brojDana = dani.childElementCount;
            assert.equal(brojDana, 31, "Neispravan broj dana! - Treba 31");
        });

        it('Prvi dan Novembra 2019 je u petak', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 10);
            var dani = _kalendarRef.querySelector(".dani");
            var stil = window.getComputedStyle(dani.firstElementChild);
            var pozicija = stil.gridColumnStart;
            assert.equal(pozicija, 5, "01.11.2019 pada u petak!");
        });

        it('Zadnji dan Novembra 2019 je u subotu', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 10);
            var dani = _kalendarRef.querySelector(".dani");

            var stilPrvog = window.getComputedStyle(dani.firstElementChild);
            var pozicijaPrvog = stilPrvog.gridColumnStart - 1;

            var brojDana = dani.childElementCount;

            var pozicijaZadnjeg = (pozicijaPrvog + brojDana) % 7;
            assert.equal(pozicijaZadnjeg, 6, "30.11.2019 pada u subotu!");
        });

        it('Mjesec Januar 2019, 1-31, počinje od utorka', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 0);
            var dani = _kalendarRef.querySelector(".dani");

            var stilPrvog = window.getComputedStyle(dani.firstElementChild);
            var pozicijaPrvog = stilPrvog.gridColumnStart;
            var brojDana = dani.childElementCount;
            expect(brojDana == 31 && pozicijaPrvog == 2, '31 dan, početak utorak!').to.equal(true)
        });


        it('Dodatni 1: Decembar 2019, prvi dan nedjelja, zadnji dan utorak', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 11);
            var dani = _kalendarRef.querySelector(".dani");

            var stilPrvog = window.getComputedStyle(dani.firstElementChild);
            var pozicijaPrvog = stilPrvog.gridColumnStart;
            var brojDana = dani.childElementCount;
            var pozicijaZadnjeg = (pozicijaPrvog - 1 + brojDana) % 7;

            expect(pozicijaPrvog != 7 && pozicijaZadnjeg != 2, 'Decembar 2019 - Prvi nedjelja, zadnji utorak').to.equal(false);
        });

        it('Dodatni 2: Juli 2019, zadnji dan srijeda', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 6);
            var dani = _kalendarRef.querySelector(".dani");

            var stilPrvog = window.getComputedStyle(dani.firstElementChild);
            var pozicijaPrvog = stilPrvog.gridColumnStart - 1;

            var brojDana = dani.childElementCount;

            var pozicijaZadnjeg = (pozicijaPrvog + brojDana) % 7;
            assert.equal(pozicijaZadnjeg, 3, "31.07.2019 pada u srijedu!");
        });


        it('Dodatni 3: Februar 2019, 1-28, počinje od petka', function () {
            Kalendar.iscrtajKalendar(_kalendarRef, 1);
            var dani = _kalendarRef.querySelector(".dani");

            var stilPrvog = window.getComputedStyle(dani.firstElementChild);
            var pozicijaPrvog = stilPrvog.gridColumnStart;
            var brojDana = dani.childElementCount;
            expect(brojDana == 28 && pozicijaPrvog == 5, '28 dana, početak petak!').to.equal(true)
        });

    });
});