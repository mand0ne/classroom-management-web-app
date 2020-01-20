const Sequelize = require('sequelize');
const Model = Sequelize.Model;

module.exports = (sequelize, DataTypes) => {
    class Sala extends Model { }

    Sala.init({
        naziv: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
            validate: {
                is: /\b[0-2]-[0-1][0-6]\b/
            }
        }
    }, {
        sequelize,
        modelName: 'Sala'
        // options
    });

    return Sala;
}