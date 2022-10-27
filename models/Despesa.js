const mongoose = require('mongoose');

const Despesa = mongoose.model('Despesa', {
  data: String,
  valor: Number,
  descricao: String,
  usuarioId: String,
  categoriaId: String,
  categoriaNome: String,
});

module.exports = Despesa;
