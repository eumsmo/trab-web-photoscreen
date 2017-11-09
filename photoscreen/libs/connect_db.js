let mongoose = require('mongoose'),
    db;

module.exports = function(){
    if(!db) db = mongoose.connect('mongodb://localhost/yourself');
    return db;
}
