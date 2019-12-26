const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
var _ = require('lodash');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res){
    res.sendFile(__dirname + "/public/html/pocetna.html");
});

app.get('/pocetna', function(req, res){
    res.sendFile(__dirname + "/public/html/pocetna.html");
});

app.get('/sale', function(req, res){
    res.sendFile(__dirname + "/public/html/sale.html");
});

app.get('/unos', function(req, res){
    res.sendFile(__dirname + "/public/html/unos.html");
});

app.get('/rezervacije', function(req, res){
    res.sendFile(__dirname + "/public/html/rezervacija.html");
});

app.get('/zauzecaJSON', function(req, res){
    res.sendFile(__dirname + "/zauzeca.json");
});

app.post('/rezervisiVanredno', function(req, res){
    fs.readFile(__dirname + '/zauzeca.json', (err, data) => {
        if (err)
            throw err;

	    // Validacija
        var zauzecaJson = JSON.parse(data);    
        var novoZauzece = req.body;
        console.log(novoZauzece);
        //console.log(zauzecaJson.vanredna);
        if(zauzecaJson.vanredna.some(vanrednoZauzece => _.isEqualWith(vanrednoZauzece, novoZauzece, komparator))){
            res.end("nmg jara");
        }
        else{
            res.end("sector clear");
        }
    
    });
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


app.get('/osobe', function(req, res){
    res.sendFile(__dirname + "/public/html/osobe.html");
});

app.listen(8080);
