module.exports = function(){

    let db = require('./../libs/connect_db')(),
        mongoose = require('mongoose'),
        Schema = mongoose.Schema,
        autoIncrement = require('mongoose-auto-increment');

    autoIncrement.initialize(db);

    let post = Schema({
          id: Number,
          url: String,
          texto: String,
          titulo: String,
          categorias: [String],
          inf: {
            por: Number,
            data: Date,
            onde: Number,
            tipo: String
          },
          interacao: {
            curtidas: [Number],
            compartilhadas: [Number],
            comentarios: [Number]
          }


        });

    post.plugin(autoIncrement.plugin, { model: 'post', field: 'id' });

    return db.model('post',post);
}
