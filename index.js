const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const chokidar = require('chokidar');
var _ = require('lodash');
const db = require('./baza.js');

var kesiraneSlikeServer = [];
const app = express();
const regex = /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/;
const sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "1-01", "1-02", "1-03", "1-04", "1-05", "1-11", "1-15", "A1", "A2", "A3", "EE1", "EE2"];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));


//////////////////////////////////////////////////////////////////
//   Pomocne funkcije potrebne prilikom procesiranja zahtjeva   //
/////////////////////////////////////////////////////////////////
function parsirajZauzecaIzBaze(rezultat) {
    var zauzecaJson = { vanredna: [], periodicna: [] };

    for (let i = 0; i < rezultat.length; i++) {
        var rezervacija = rezultat[i];

        if (rezervacija.redovni == 1) {
            // Periodicno zauzece
            var periodicnoZauzece = {
                dan: rezervacija.dan, semestar: rezervacija.semestar, pocetak: rezervacija.pocetak, kraj: rezervacija.kraj,
                naziv: rezervacija.naziv, predavac: rezervacija.predavac
            };

            zauzecaJson.periodicna.push(periodicnoZauzece);
        }
        else {
            // Vanrendo zauzece
            var rezervacijaDatum = rezervacija.datum.split(".");

            var vanrednoZauzece = {
                datum: {
                    dan: parseInt(rezervacijaDatum[0]),
                    mjesec: parseInt(rezervacijaDatum[1]) - 1,
                    godina: parseInt(rezervacijaDatum[2])
                }, pocetak: rezervacija.pocetak, kraj: rezervacija.kraj,
                naziv: rezervacija.naziv, predavac: rezervacija.predavac
            };
            zauzecaJson.vanredna.push(vanrednoZauzece);
        }
    }

    return zauzecaJson;
}

function validirajVanredno(novoZauzece) {
    if (Object.keys(novoZauzece).length != 5 || novoZauzece.datum == null || Object.keys(novoZauzece.datum).length != 3 || novoZauzece.pocetak == null
        || novoZauzece.kraj == null || novoZauzece.naziv == null || novoZauzece.predavac == null)
        throw "Neispravan format JSON-a!";

    if (!sale.includes(novoZauzece.naziv))
        throw "Sala " + novoZauzece.naziv + " ne postoji!";

    if (!regex.test(novoZauzece.pocetak) || !regex.test(novoZauzece.kraj))
        throw "Neispravni vremenski periodi unutar JSON-a! (24h format, hh:mm)";

    if (novoZauzece.datum.dan == null || novoZauzece.datum.mjesec == null
        || novoZauzece.datum.godina == null ||
        novoZauzece.datum.dan < 1 || novoZauzece.datum.dan > 31 || novoZauzece.datum.mjesec < 0 || novoZauzece.datum.mjesec > 11
        || novoZauzece.datum.godina != new Date().getFullYear())
        throw "Neispravan datum unutar JSON-a!\n(Dan 1-31, Mjesec 0-11, Godina mora biti trenutna)";
}

function validirajPeriodicno(novoZauzece) {
    if (Object.keys(novoZauzece).length != 6 || novoZauzece.dan == null || novoZauzece.semestar == null
        || novoZauzece.pocetak == null || novoZauzece.kraj == null || novoZauzece.naziv == null || novoZauzece.predavac == null)
        throw "Neispravan format JSON-a!";

    if (!sale.includes(novoZauzece.naziv))
        throw "Sala " + novoZauzece.naziv + " ne postoji!";

    if (!regex.test(novoZauzece.pocetak) || !regex.test(novoZauzece.kraj))
        throw "Neispravni vremenski periodi unutar JSON-a! (24h format, hh:mm)";

    if (novoZauzece.dan < 0 || novoZauzece.dan > 6
        || (novoZauzece.semestar != "ljetni" && novoZauzece.semestar != "zimski"))
        throw "Neispravan datum unutar JSON-a!\n(Dan 1-31, Mjesec 0-11, Godina mora biti trenutna)";
}

// Pomocne funkcije za provjeru da li postoji preklapanje izmedu razlicitih zauzeca
// Kasnije se koristi uz lodash sa metodom _.isEqualWith
function komparatorVanredna(objekatVanrednih, novoVanredno) {
    var vanrednoPocetak = parseInt(objekatVanrednih.pocetak.replace(':', ''));
    var vanrednoKraj = parseInt(objekatVanrednih.kraj.replace(':', ''));
    var novoVanrednoPocetak = parseInt(novoVanredno.pocetak.replace(':', ''));
    var novoVanrednoKraj = parseInt(novoVanredno.kraj.replace(':', ''));

    return (_.isEqual(objekatVanrednih.datum, novoVanredno.datum) && objekatVanrednih.naziv == novoVanredno.naziv
        && Math.max(vanrednoPocetak, novoVanrednoPocetak) < Math.min(vanrednoKraj, novoVanrednoKraj));
}

function komparatorPeriodicna(objekatPeriodicnih, novoPeriodicno) {
    var periodicnoPocetak = parseInt(objekatPeriodicnih.pocetak.replace(':', ''));
    var periodicnoKraj = parseInt(objekatPeriodicnih.kraj.replace(':', ''));
    var novoPeriodicnoPocetak = parseInt(novoPeriodicno.pocetak.replace(':', ''));
    var novoPeriodicnoKraj = parseInt(novoPeriodicno.kraj.replace(':', ''));

    return (objekatPeriodicnih.dan == novoPeriodicno.dan && objekatPeriodicnih.semestar == novoPeriodicno.semestar
        && objekatPeriodicnih.naziv == novoPeriodicno.naziv
        && Math.max(periodicnoPocetak, novoPeriodicnoPocetak) < Math.min(periodicnoKraj, novoPeriodicnoKraj));
}

function komparatorPeriodicnoVanredno(periodicno, vanredno) {
    // Koji dan 'pada' ovaj datum ?
    // Treba da testiramo dostupnost s obzirom na periodicna zauzeca

    datum = new Date(parseInt(vanredno.datum.godina), parseInt(vanredno.datum.mjesec), parseInt(vanredno.datum.dan));
    var danVanrednogZauzeca = (datum.getDay() + 6) % 7;
    if (![0, 1, 2, 3, 4, 5, 9, 10, 11].includes(parseInt(vanredno.datum.mjesec)))
        return false;
    else if (parseInt(vanredno.datum.mjesec) >= 1 && parseInt(vanredno.datum.mjesec) <= 5)
        semestarVanrednogZauzeca = "ljetni";
    else
        semestarVanrednogZauzeca = "zimski";

    var periodicnoPocetak = parseInt(periodicno.pocetak.replace(':', ''));
    var periodicnoKraj = parseInt(periodicno.kraj.replace(':', ''));
    var vanrednoPocetak = parseInt(vanredno.pocetak.replace(':', ''));
    var vanrednoKraj = parseInt(vanredno.kraj.replace(':', ''));

    return (danVanrednogZauzeca == periodicno.dan && periodicno.semestar == semestarVanrednogZauzeca && periodicno.naziv == vanredno.naziv
        && Math.max(periodicnoPocetak, vanrednoPocetak) < Math.min(periodicnoKraj, vanrednoKraj));

}

///////////////////////////////
//   PROCESIRANJE ZAHTJEVA  //
/////////////////////////////

/// GET localhost:8080
app.get('/', function (req, res) {
    res.status(200).sendFile(__dirname + "/public/pocetna.html");
});

// GET localhost:8080/zauzeca
app.get('/zauzeca', function (req, res) {

    db.sequelize.query("SELECT CONCAT(o.uloga, ' ', o.ime, ' ', o.prezime) as 'predavac', s.naziv as 'naziv', t.redovni as 'redovni', t.dan as 'dan', t.datum as 'datum', t.semestar as 'semestar', TIME_FORMAT(t.pocetak, '%H:%i') as 'pocetak', TIME_FORMAT(t.kraj, '%H:%i') as 'kraj' FROM osobljes o, salas s, termins t, rezervacijas r  WHERE r.termin = t.id AND r.sala = s.id AND r.osoba = o.id", { type: db.Sequelize.QueryTypes.SELECT }).then(rezultat => {
        // Ovdje sad imamo sve rezervacije, treba ih sada posebno obraditi u adekvatan oblik (periodicno ili vanredno)

        parsiranaZauzeca = parsirajZauzecaIzBaze(rezultat);
        res.status(200).send(parsiranaZauzeca);
    }).catch(err => { console.log("Greška pri dobavljanju zauzeca: " + err) });
});


// GET localhost:8080/osoblje
app.get('/osoblje', function (req, res) {
    db.sequelize.query("SELECT * FROM `osobljes`", { type: db.Sequelize.QueryTypes.SELECT })
        .then(osobe => {
            res.status(200).send(osobe);
        }).catch(err => { res.sendStatus(400); console.log("Error: " + err); });
});

// GET localhost:8080/sale
app.get('/sale', function (req, res) {
    db.sequelize.query("SELECT * FROM `salas`", { type: db.Sequelize.QueryTypes.SELECT })
        .then(sale => {
            res.status(200).send(sale);
        }).catch(err => { res.sendStatus(400); console.log("Error: " + err); });
});

// GET localhost:8080/images
app.get('/images', function (req, res) {
    let slike = "";
    let indexTrenutneSlike = req.query['trenutna'];

    for (let i = 0; i < 3; i++) {
        if (indexTrenutneSlike < kesiraneSlikeServer.length)
            slike += "<div><img src=\"/images/" + kesiraneSlikeServer[indexTrenutneSlike] + "\" alt=\"Slika\"/></div>";
        else {
            res.status(202).send(slike);
            return;
        }
        indexTrenutneSlike++;
    }

    if (indexTrenutneSlike >= kesiraneSlikeServer.length) {
        res.status(202).send(slike);
        return;
    }

    res.status(200).end(slike);
});



// POST localhost:8080/rezervisiPeriodicno
app.post('/rezervisiPeriodicno', function (req, res) {

    db.sequelize.query("SELECT CONCAT(o.uloga, ' ', o.ime, ' ', o.prezime) as 'predavac', s.naziv as 'naziv', t.redovni as 'redovni', t.dan as 'dan', t.datum as 'datum', t.semestar as 'semestar', TIME_FORMAT(t.pocetak, '%H:%i') as 'pocetak', TIME_FORMAT(t.kraj, '%H:%i') as 'kraj' FROM osobljes o, salas s, termins t, rezervacijas r  WHERE r.termin = t.id AND r.sala = s.id AND r.osoba = o.id", { type: db.Sequelize.QueryTypes.SELECT }).then(rezultat => {

        try {
            novoZauzece = req.body;
            validirajPeriodicno(novoZauzece);
        } catch (error) {
            res.status(400).send(error);
        }

        // Ovdje sad imamo sve rezervacije, treba ih sada posebno obraditi u adekvatan oblik (periodicno ili vanredno)

        var zauzecaJson = parsirajZauzecaIzBaze(rezultat);

        // Validacija
        // Provjera dostupnosti uz Lodash
        for (let i = 0; i < zauzecaJson.vanredna.length; i++) {
            var vanrednoZauzece = zauzecaJson.vanredna[i];

            if (_.isEqualWith(novoZauzece, vanrednoZauzece, komparatorPeriodicnoVanredno)) {
                res.status(403).send({ zauzeceKojeSprjecava: vanrednoZauzece, svjezaZauzeca: zauzecaJson });
                return;
            }
        }

        for (let i = 0; i < zauzecaJson.periodicna.length; i++) {
            var periodicnoZauzece = zauzecaJson.periodicna[i];

            if (_.isEqualWith(periodicnoZauzece, novoZauzece, komparatorPeriodicna)) {
                res.status(403).send({ zauzeceKojeSprjecava: periodicnoZauzece, svjezaZauzeca: zauzecaJson });
                return;
            }
        }

        // Sala nije zauzeta, insert u bazu putem ulancanih promisa                 
        zauzecaJson.periodicna.push(novoZauzece);
        predavac = novoZauzece.predavac.split(" ");

        db.osoblje.findOrCreate({
            where: { uloga: predavac[0], ime: predavac[1], prezime: predavac[2] }
        }).then(function ([osoba, created]) {
            idOsobe = osoba.id;

            db.termin.findOrCreate({
                where: { redovni: true, dan: novoZauzece.dan, datum: null, semestar: novoZauzece.semestar, pocetak: novoZauzece.pocetak, kraj: novoZauzece.kraj }
            }).then(function ([termin, created]) {
                idTermina = termin.id;


                db.sala.findOrCreate({
                    where: { naziv: novoZauzece.naziv }
                }).then(function ([sala, created]) {
                    idSale = sala.id;

                    db.rezervacija.findOrCreate({
                        where: { termin: idTermina, sala: idSale, osoba: idOsobe }
                    }).then(function ([rezervacija, created]) {
                        res.status(200).send(zauzecaJson);
                    }).catch(err => { console.log(err); });

                }).catch(err => { console.log(err); });

            }).catch(err => { console.log(err); });

        }).catch(err => { console.log(err); });

    }).catch(err => { console.log(err); });
});


// POST localhost:8080/rezervisiVanredno
app.post('/rezervisiVanredno', function (req, res) {
    db.sequelize.query("SELECT CONCAT(o.uloga, ' ', o.ime, ' ', o.prezime) as 'predavac', s.naziv as 'naziv', t.redovni as 'redovni', t.dan as 'dan', t.datum as 'datum', t.semestar as 'semestar', TIME_FORMAT(t.pocetak, '%H:%i') as 'pocetak', TIME_FORMAT(t.kraj, '%H:%i') as 'kraj' FROM osobljes o, salas s, termins t, rezervacijas r  WHERE r.termin = t.id AND r.sala = s.id AND r.osoba = o.id", { type: db.Sequelize.QueryTypes.SELECT }).then(rezultat => {

        try {
            novoZauzece = req.body;
            validirajVanredno(novoZauzece);

        } catch (error) {
            res.status(400).send(error);
            reject(error);
        }

        // Ovdje sad imamo sve rezervacije, treba ih sada posebno obraditi u adekvatan oblik (periodicno ili vanredno)

        var zauzecaJson = parsirajZauzecaIzBaze(rezultat);

        // Validacija
        // Provjera dostupnosti uz Lodash
        for (let i = 0; i < zauzecaJson.vanredna.length; i++) {
            var vanrednoZauzece = zauzecaJson.vanredna[i];

            if (_.isEqualWith(vanrednoZauzece, novoZauzece, komparatorVanredna)) {
                res.status(403).send({ zauzeceKojeSprjecava: vanrednoZauzece, svjezaZauzeca: zauzecaJson });
                return;
            }
        }

        for (let i = 0; i < zauzecaJson.periodicna.length; i++) {
            var periodicnoZauzece = zauzecaJson.periodicna[i];

            if (_.isEqualWith(periodicnoZauzece, novoZauzece, komparatorPeriodicnoVanredno)) {
                res.status(403).send({ zauzeceKojeSprjecava: periodicnoZauzece, svjezaZauzeca: zauzecaJson });
                return;
            }
        }

        // Sala nije zauzeta, insert u bazu  putem ulancanih promisa              
        zauzecaJson.vanredna.push(novoZauzece);
        predavac = novoZauzece.predavac.split(" ");

        db.osoblje.findOrCreate({
            where: { uloga: predavac[0], ime: predavac[1], prezime: predavac[2] }
        }).then(function ([osoba, created]) {
            idOsobe = osoba.id;

            db.termin.findOrCreate({
                where: { redovni: false, dan: null, datum: novoZauzece.datum.dan + "." + (novoZauzece.datum.mjesec + 1) + "." + novoZauzece.datum.godina, semestar: null, pocetak: novoZauzece.pocetak, kraj: novoZauzece.kraj }
            }).then(function ([termin, created]) {
                idTermina = termin.id;

                db.sala.findOrCreate({
                    where: { naziv: novoZauzece.naziv }
                }).then(function ([sala, created]) {
                    idSale = sala.id;

                    db.rezervacija.findOrCreate({
                        where: { termin: idTermina, sala: idSale, osoba: idOsobe }
                    }).then(function ([rezervacija, created]) {
                        res.status(200).send(zauzecaJson);
                    }).catch(err => { console.log(err); });

                }).catch(err => { console.log(err); });

            }).catch(err => { console.log(err); });

        }).catch(err => { console.log(err); });

    }).catch(err => { console.log(err); });
});

app.get('/rezervacijeOsoba', function (req, res) {
    var today = new Date();
    var trenutniDatum = today.getDate() + '.' + (today.getMonth() + 1) + '.' + today.getFullYear();
    var trenutniDan = (today.getDay() + 6) % 7;
    var trenutnoVrijeme = parseInt(today.getHours().toString() + today.getMinutes().toString());

    console.log(trenutniDan);
    db.sequelize.query("SELECT o.ime as 'ime', o.prezime as 'prezime', o.uloga as 'uloga', s.naziv as 'naziv' " +
        "FROM osobljes o, salas s, termins t, rezervacijas r " +
        "WHERE r.termin = t.id and r.sala = s.id and r.osoba = o.id and TIME_FORMAT(t.pocetak, '%H%i') <= ? and TIME_FORMAT(t.kraj, '%H%i') >= ? " +
        "AND ((datum IS NOT NULL AND datum = ?)  OR (dan IS NOT NULL AND dan = ?))",
        { replacements: [trenutnoVrijeme, trenutnoVrijeme, trenutniDatum, trenutniDan], type: db.sequelize.QueryTypes.SELECT })
        .then(osobeKojeSuRezervisale => {
            console.log(osobeKojeSuRezervisale);
            db.sequelize.query("SELECT ime as 'ime', prezime as 'prezime', uloga as 'uloga', 'kancelariji' as 'naziv' FROM osobljes",
                { type: db.sequelize.QueryTypes.SELECT })
                .then(sveOsobe => {

                    for (let i = 0; i < sveOsobe.length; i++) {
                        var x = sveOsobe[i];
                        var osobaX = x.uloga + " " + x.ime + " " + x.prezime;

                        for (let j = 0; j < osobeKojeSuRezervisale.length; j++) {
                            var y = osobeKojeSuRezervisale[j];
                            var osobaY = y.uloga + " " + y.ime + " " + y.prezime;

                            if (osobaX == osobaY)
                                sveOsobe[i].naziv = y.naziv;
                        }
                    }

                    res.status(200).send(sveOsobe);
                }).catch(err => { res.sendStatus(400); console.log(err); });;

        }).catch(err => { res.sendStatus(400); console.log(err); });;
});


db.sequelize.sync({ force: true }).then(function () {
    db.inicijalizacija().then(function () {
        console.log("Gotovo kreiranje tabela i ubacivanje pocetnih podataka!");
        app.listen(8080, 'localhost', function () {
            console.log('App has started');
            app.emit("appStarted");
        });
    });
});

// Odma na pocetku kesiraj sve slike, kasnije pomocu chokidara prati promjene...
fs.readdir(__dirname + "/public/images/", (err, files) => {
    if (err)
        throw err;

    kesiraneSlikeServer = [];
    files.forEach(file => {
        kesiraneSlikeServer.push(file);
    });
});


// Pomocu chokidar pratimo promjene u folderu /public/images
const watcher = chokidar.watch(__dirname + '/public/images', {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true
});

const log = console.log.bind(console);
// Listener
watcher.on('add', path => {
    var putanja = path.split('\\');
    var slika = putanja[putanja.length - 1];
    kesiraneSlikeServer.push(slika);
    log(`File ${path} has been added`)
}).on('unlink', path => {
    log(`File ${path} has been deleted. Caching again.`)

    fs.readdir(__dirname + "/public/images/", (err, files) => {
        if (err)
            throw err;

        kesiraneSlikeServer = [];
        files.forEach(file => {
            kesiraneSlikeServer.push(file);
        });
    });
});

module.exports = app;