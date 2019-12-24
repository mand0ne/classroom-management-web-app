const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.get('/', function(req, res){
    res.sendFile(__dirname + "/html/pocetna.html");
});

app.get('/pocetna', function(req, res){
    res.sendFile(__dirname + "/html/pocetna.html");
});

app.get('/sale', function(req, res){
    res.sendFile(__dirname + "/html/sale.html");
});

app.get('/unos', function(req, res){
    res.sendFile(__dirname + "/html/unos.html");
});

app.get('/rezervacije', function(req, res){
    res.sendFile(__dirname + "/html/rezervacija.html");
});

app.get('/zauzeca', function(req, res){
    res.sendFile(__dirname + "/zauzeca.json");
});

app.listen(8080);