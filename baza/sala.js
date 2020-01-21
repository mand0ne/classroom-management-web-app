const Sequelize = require('sequelize');
const Model = Sequelize.Model;

module.exports = (sequelize, DataTypes) => {
    class Sala extends Model { }

    Sala.init({
        naziv: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'Sala'
    });

    return Sala;
}