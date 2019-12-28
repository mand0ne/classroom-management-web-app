const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
var _ = require('lodash');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get('/', function (req, res) {
    res.sendFile(__dirname + "/public/pocetna.html");
});

app.get('/zauzecaJSON', function (req, res) {
    res.sendFile(__dirname + "/zauzeca.json");
});

app.post('/rezervisiVanredno', function (req, res) {
    try {
        novoZauzece = req.body;
        const regex = /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/;
        var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "1-01", "1-02", "1-03", "1-04", "1-05", "A1", "A2", "A3", "EE1", "EE2"];

        if (Object.keys(novoZauzece).length != 5 || novoZauzece.datum == null || Object.keys(novoZauzece.datum).length != 3 || novoZauzece.pocetak == null || novoZauzece.kraj == null || novoZauzece.naziv == null || novoZauzece.predavac == null)
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

        fs.readFile(__dirname + '/zauzeca.json', (err, data) => {
            if (err)
                throw err;

            // Validacija
            var zauzecaJson = JSON.parse(data);
            var novoZauzece = req.body; // moze zbog bodyParser.json()

            // Provjera dostupnosti uz Lodash
            if (zauzecaJson.vanredna.some(vanrednoZauzece => _.isEqualWith(vanrednoZauzece, novoZauzece, komparatorVanredna)) ||
                zauzecaJson.periodicna.some(periodicnoZauzece => _.isEqualWith(periodicnoZauzece, novoZauzece, komparatorPeriodicnoVanredno))) {

                res.status(403);
            }
            else {
                zauzecaJson.vanredna.push(novoZauzece);
                fs.writeFile(__dirname + "/zauzeca.json", JSON.stringify(zauzecaJson), function (err) {
                    if (err)
                        throw err;

                    res.status(200);
                });
            }

            res.send(zauzecaJson);
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

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
    var danVanrednogZauzeca = (new Date(vanredno.datum.godina, vanredno.datum.mjesec, vanredno.datum.dan).getDay() + 6) % 7;

    var semestarVanrednogZauzeca;
    if (![0, 1, 2, 3, 4, 5, 9, 10, 11].includes(vanredno.datum.mjesec))
        return false;
    else if (vanredno.datum.mjesec >= 1 && vanredno.datum.mjesec <= 5)
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

app.post('/rezervisiPeriodicno', function (req, res) {
    try {
        novoZauzece = req.body;
        const regex = /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/;
        var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "1-01", "1-02", "1-03", "1-04", "1-05", "A1", "A2", "A3", "EE1", "EE2"];

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

        fs.readFile(__dirname + '/zauzeca.json', (err, data) => {
            if (err)
                throw err;

            // Validacija
            var zauzecaJson = JSON.parse(data);
            var novoZauzece = req.body; // moze zbog bodyParser.json()

            // Provjera dostupnosti uz Lodash, sada uz drugacije komparator funkcije
            if (zauzecaJson.vanredna.some(vanrednoZauzece => _.isEqualWith(novoZauzece, vanrednoZauzece, komparatorPeriodicnoVanredno)) ||
                zauzecaJson.periodicna.some(periodicnoZauzece => _.isEqualWith(periodicnoZauzece, novoZauzece, komparatorPeriodicna))) {

                res.status(403);
            }
            else {
                zauzecaJson.periodicna.push(novoZauzece);
                fs.writeFile(__dirname + "/zauzeca.json", JSON.stringify(zauzecaJson), function (err) {
                    if (err)
                        throw err;

                    res.status(200);
                });
            }

            res.send(zauzecaJson);
        });
    } catch (error) {
        res.status(400).send(error);
    }
});

app.listen(8080);