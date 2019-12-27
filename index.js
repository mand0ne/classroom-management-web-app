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
        console.log("NOVO ZAUZECE: " + novoZauzece);
        const regex = /^(0[0-9]|1[0-9]|2[0-3]|[0-9]):[0-5][0-9]$/;

        var sale = ["0-01", "0-02", "0-03", "0-04", "0-05", "1-01", "1-02", "1-03", "1-04", "1-05", "A1", "A2", "A3", "EE1", "EE2"];
        
        console.log(novoZauzece.datum.dan);
        console.log(Object.keys(novoZauzece).length);
        console.log(Object.keys(novoZauzece.datum).length);
        if ( Object.keys(novoZauzece).length != 5 || Object.keys(novoZauzece.datum).length != 3 || novoZauzece.datum.dan < 1 || novoZauzece.datum.dan > 31 ||
            novoZauzece.datum.mjesec < 0 || novoZauzece.datum.mjesec > 11
            || novoZauzece.datum.godina != new Date().getFullYear()
            || !regex.test(novoZauzece.pocetak) || !regex.test(novoZauzece.kraj)
            || !sale.includes(novoZauzece.naziv))

            throw "Neispravan JSON!";

        
        fs.readFile(__dirname + '/zauzeca.json', (err, data) => {
            if (err)
                throw err;
    
            // Validacija
            var zauzecaJson = JSON.parse(data);    
            var novoZauzece = req.body;
            var danZauzeca = kliknutiDan = (new Date(novoZauzece.datum.godina, novoZauzece.datum.mjesec, novoZauzece.datum.dan).getDay() + 6) % 7;
            console.log("DAN: " + danZauzeca);
            //console.log(zauzecaJson.vanredna);
            if(zauzecaJson.vanredna.some(vanrednoZauzece => _.isEqualWith(vanrednoZauzece, novoZauzece, komparator))){
                console.log("udje i ovdje");
                res.send("nmg jara");
                
            }
            else{
                res.send("sector clear");
                
            }
        
        }); 

        
    } catch (error) {
        console.log("BACI GA");
        res.sendStatus(400);
    }


});

function komparator(objekatVanrednih, novoVanredno) {
    //console.log("ŠTA JE OVOOOOOO:" + objekatVanrednih);
    //console.log(novoVanredno);
    var objekatVanrednoPocetak = parseInt(objekatVanrednih.pocetak.replace(':', ''));
    var objekatVanrednoKraj = parseInt(objekatVanrednih.kraj.replace(':', ''));
    var novoVanrednoPocetak = parseInt(novoVanredno.pocetak.replace(':', ''));
    var novoVanrednoKraj = parseInt(novoVanredno.kraj.replace(':', ''));

    return (_.isEqual(objekatVanrednih.datum, novoVanredno.datum) && objekatVanrednih.naziv == novoVanredno.naziv
        && Math.max(objekatVanrednoPocetak, novoVanrednoPocetak) < Math.min(objekatVanrednoKraj, novoVanrednoKraj));
}


app.listen(8080);
