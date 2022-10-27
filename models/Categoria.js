const mongoose = require('mongoose');

const Categoria = mongoose.model('Categoria', {
  nome: String,
  descricao: String,
  usuarioId: String,
});

module.exports = Categoria;
