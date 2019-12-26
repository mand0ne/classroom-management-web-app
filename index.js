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

        var zauzecaJson = JSON.parse(data);
        var novoZauzece = res.body;

        console.log(novoZauzece);
        res.send(novoZauzece);
    });
});

app.get('/osobe', function(req, res){
    res.sendFile(__dirname + "/public/html/osobe.html");
});

app.listen(8080);