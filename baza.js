const Sequelize = require("sequelize");

const sequelize = new Sequelize("dbwt19", "root", "root", {
    host: "localhost",
    dialect: "mysql",
    logging: false,
    define: {
        timestamps: false
    }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// [IMPORT MODELA]
db.osoblje = sequelize.import(__dirname + '/baza/osoblje.js');
db.rezervacija = sequelize.import(__dirname + '/baza/rezervacija.js');
db.sala = sequelize.import(__dirname + '/baza/sala.js');
db.termin = sequelize.import(__dirname + '/baza/termin.js');

// [RELACIJE]
// Veza 1-n (osoblje - rezervacija)
db.rezervacija.belongsTo(db.osoblje, { as: 'osobaRezervacije', foreignKey: { name: 'osoba', allowNull: false }, onDelete: 'cascade' });
db.osoblje.hasMany(db.rezervacija, { as: 'osobaRezervacije', foreignKey: { name: 'osoba', allowNull: false }, onDelete: 'cascade' });

// Veza 1-1 (rezervacija - termin)
db.rezervacija.belongsTo(db.termin, { as: 'terminRezervacije', foreignKey: { name: 'termin', unique: true, allowNull: false }, onDelete: 'cascade' });
db.termin.hasOne(db.rezervacija, { as: 'terminRezervacije', foreignKey: { name: 'termin', unique: true, allowNull: false }, onDelete: 'cascade' });

// Veza n-1 (rezervacija - sala)
db.rezervacija.belongsTo(db.sala, { as: 'salaRezervacije', foreignKey: { name: 'sala', allowNull: false }, onDelete: 'cascade' });
db.sala.hasMany(db.rezervacija, { as: 'salaRezervacije', foreignKey: { name: 'sala', allowNull: false }, onDelete: 'cascade' });

// Veza 1-1 (sala - osobe)
db.sala.belongsTo(db.osoblje, { as: 'zaduzenaOsobaSale', foreignKey: { name: 'zaduzenaOsoba', allowNull: true }, onDelete: 'cascade' });
db.osoblje.hasOne(db.sala, { as: 'zaduzenaOsobaSale', foreignKey: { name: 'zaduzenaOsoba', allowNull: true }, onDelete: 'cascade' });

let inicijalizacija = function inicializacija() {
    var osobeListaPromisa = [];
    var saleListaPromisa = [];
    var terminiListaPromisa = [];
    var rezervacijeListaPromisa = [];

    return new Promise(function (resolve, reject) {
        osobeListaPromisa.push(db.osoblje.create({ ime: 'Neko', prezime: 'Nekic', uloga: 'profesor' }));
        osobeListaPromisa.push(db.osoblje.create({ ime: 'Drugi', prezime: 'Neko', uloga: 'asistent' }));
        osobeListaPromisa.push(db.osoblje.create({ ime: 'Test', prezime: 'Test', uloga: 'asistent' }));

        Promise.all(osobeListaPromisa).then(function (osobe) {
            saleListaPromisa.push(db.sala.create({ naziv: '1-11', zaduzenaOsoba: '1' }));
            saleListaPromisa.push(db.sala.create({ naziv: '1-15', zaduzenaOsoba: '2' }));

            Promise.all(saleListaPromisa).then(function (sale) {
                terminiListaPromisa.push(db.termin.create({ redovni: false, dan: null, datum: "01.01.2020", semestar: null, pocetak: '12:00', kraj: '13:00' }));
                terminiListaPromisa.push(db.termin.create({ redovni: true, dan: 0, datum: null, semestar: "zimski", pocetak: '13:00', kraj: '14:00' }));

                Promise.all(terminiListaPromisa).then(function (termini) {
                    rezervacijeListaPromisa.push(db.rezervacija.create({ termin: '1', sala: '1', osoba: '1' }));
                    rezervacijeListaPromisa.push(db.rezervacija.create({ termin: '2', sala: '1', osoba: '3' }));

                    Promise.all(rezervacijeListaPromisa).then(function (rezervacije) {
                        resolve(rezervacije);
                    }).catch(function (err) { console.log("Rezervacije inicijalizacija rror: " + err); });

                }).catch(function (err) { console.log("Termini inicijalizacija error: " + err); });

            }).catch(function (err) { console.log("Sale inicijalizacija error: " + err); });

        }).catch(function (err) { console.log("Osoblje inicijalizacija error: " + err); });
    });
}

module.exports = db;
module.exports.inicijalizacija = inicijalizacija;