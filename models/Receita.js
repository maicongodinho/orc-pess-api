const mongoose = require('mongoose');

const Receita = mongoose.model('Receita', {
  data: String,
  valor: Number,
  descricao: String,
  usuarioId: String,
  categoriaId: String,
  categoriaNome: String,
});

module.exports = Receita;
