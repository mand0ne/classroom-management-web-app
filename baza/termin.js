const Sequelize = require('sequelize');
const Model = Sequelize.Model;

module.exports = (sequelize, DataTypes) => {
    class Termin extends Model { }

    Termin.init({
        redovni: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        dan: {
            type: DataTypes.INTEGER,
            validate: {
                is: /^[0-6]$/
            }
        },
        datum: {
            type: DataTypes.STRING,
            validate: {
                is: /^((3[01]|[12][0-9]|0?[1-9])\.(1[012]|0?[1-9])\.((?:19|20)\d{2}))|(\bnull\b)$/
            }
        },
        semestar: DataTypes.STRING,
        pocetak: {
            type: DataTypes.TIME,
            allowNull: false
        },
        kraj: {
            type: DataTypes.TIME,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Termin'
    });

    return Termin;
}