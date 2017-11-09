module.exports = function(){
    let db = require('./../libs/connect_db')(),
        Schema = require('mongoose').Schema,
        inf = Schema({
            id: Number,
            inf:{
              nome: String,
              foto_perfil: String,
              extras: {
                descricao: String,
                genero: String,
                interesse: String,
                aniversario: Date,
                religiao: String,
                politica: String,
                local: String
              },
              seguindo: [Number],
              seguidores: [Number],
              interesses: [String],
              posts: [Number]
            }
        });

    return db.model('user_inf',inf);
}
