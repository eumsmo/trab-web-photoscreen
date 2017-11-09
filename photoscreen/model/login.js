module.exports = function(){
    let db = require('./../libs/connect_db')(),
        mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        autoIncrement = require('mongoose-auto-increment');

    autoIncrement.initialize(db);

    let login = Schema({
        id: {
          type: Number,
          index: true,
          unique: true
        },
        nome: String,
        email: String,
        senha: String
    });

    login.plugin(autoIncrement.plugin, { model: 'login', field: 'id' });

    return db.model('login',login);
}
