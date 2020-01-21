const Sequelize = require('sequelize');
const Model = Sequelize.Model;

module.exports = (sequelize, DataTypes) => {
    class Osoblje extends Model { }

    Osoblje.init({
        // attributes
        ime: DataTypes.STRING,
        prezime: DataTypes.STRING,
        uloga: DataTypes.STRING
    },
        {
            sequelize,
            modelName: 'Osoblje'
        });
    return Osoblje;
}
