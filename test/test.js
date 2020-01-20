const expect = require('chai').expect;
const assert = require('chai').assert;
const supertest = require('supertest');
const app = require('../index.js');
const api = supertest(app);
const _ = require('lodash');

describe("Testiranje serverskih funkcionalnosti: ", function () {

    let zauzeca = [];
    let novoZauzece = {
        datum: {
            dan: 20,
            mjesec: 0,
            godina: 2020
        }, pocetak: "09:00", kraj: "13:00", naziv: "0-01", predavac: "profesor Albert Einstein"
    };

    let novoZauzeceDrugiProfesor = {
        datum: {
            dan: 20,
            mjesec: 0,
            godina: 2020
        }, pocetak: "09:00", kraj: "13:00", naziv: "0-01", predavac: "profesor Stephen Hawking"
    };

    let periodicnoZauzece1 = { dan: 0, semestar: "zimski", pocetak: "08:00", kraj: "22:00", naziv: "0-01", predavac: "profesor Nikola Tesla" };
    let periodicnoZauzece2 = { dan: 1, semestar: "zimski", pocetak: "08:00", kraj: "22:00", naziv: "0-01", predavac: "profesor Richard Feynman" };

    before(done => {
        app.on('appStarted', () => {
            done();
        });
    });


    it("GET /osoblje treba vraca status kod 200", function (done) {
        api.get('/osoblje')
            .set('Accept', 'application/json')
            .expect(200)
            .expect('Content-Type', /json/)
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("GET /zauzecaDB treba vraca status kod 200", function (done) {
        api.get('/zauzecaDB')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                zauzeca = res.body;
                assert.equal(res.statusCode, 200);
                assert.equal(res.body.vanredna.length, 1);
                assert.equal(res.body.periodicna.length, 1);
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo zauzece se treba ispravno dodati i azurirati prethodna zauzeca", function (done) {
        api.post("/rezervisiVanrednoDB")
            .send(novoZauzece)
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.vanredna.length, 2); // trebaju biti 2 vanredna zauzeca
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Drugi profesor ne moze zauzeti vec postojece zauzece", function (done) {
        api.post("/rezervisiVanrednoDB")
            .send(novoZauzeceDrugiProfesor)
            .expect(403)
            .expect(function (res) {
                assert.equal(res.body.svjezaZauzeca.vanredna.length, 2); // ostala su 2 vanredna zauzeca
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });


    it("Novo zauzece je dodalo novu salu u bazu, salu 0-01", function (done) {
        supertest(app).get('/sale')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                let salaRegex = new RegExp("^((1-1[1,5])|(0-01))$");
                assert.equal(res.body.length, 3);
                assert.ok(salaRegex.test(res.body[0].naziv));
                assert.ok(salaRegex.test(res.body[1].naziv));
                assert.ok(salaRegex.test(res.body[2].naziv));
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo zauzece je dodalo novog profesora u bazu, prof. Albert Einsteina", function (done) {
        supertest(app).get('/osoblje')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 4);
                assert.equal(res.body.some(osoba => _.isEqual({ ime: osoba.ime, prezime: osoba.prezime, uloga: osoba.uloga },
                    { ime: "Albert", prezime: "Einstein", uloga: "profesor" })), true);
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Profesor Test Test se trenutno nalazi u kancelariji", function (done) {
        supertest(app).get('/rezervacijeOsoba')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 4);
                assert.equal(res.body.some(rezervacija => _.isEqual({ ime: rezervacija.ime, naziv: rezervacija.naziv }, { ime: 'Test', naziv: 'kancelariji' })), true);
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Periodicno zauzece ponedjeljkom ne moze. Sala zauzeta 20.01. u tom terminu", function (done) {
        supertest(app)
            .post("/rezervisiPeriodicnoDB")
            .send(periodicnoZauzece1)
            .expect(403)
            .expect(function (res) {
                assert.equal(res.body.svjezaZauzeca.periodicna.length, 1); // treba biti samo jedno periodicno
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Novo periodicno zauzece utorkom se ispravno dodaje", function (done) {
        supertest(app)
            .post("/rezervisiPeriodicnoDB")
            .send(periodicnoZauzece2)
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.periodicna.length, 2); // dodali smo novu periodicnu
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

    it("Imamo novog profesora, sad ih je 5", function (done) {
        supertest(app).get('/osoblje')
            .set('Accept', 'application/json')
            .expect(200)
            .expect(function (res) {
                assert.equal(res.body.length, 5);
            })
            .then(response => {
                done();
            }).catch(err => {
                done(err);
            })
    });

});