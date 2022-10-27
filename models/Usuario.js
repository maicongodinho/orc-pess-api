const mongoose = require('mongoose');

const Usuario = mongoose.model('Usuario', {
  email: String,
  nome: String,
  sobrenome: String,
  senha: String,
});

module.exports = Usuario;
