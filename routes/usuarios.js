var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();
var Usuario = require('../models/Usuario');
var { validarEmail } = require('../utils/email');
var { generateToken } = require('../utils/jwt');

/**
 * @openapi
 * /usuarios/registrar:
 *  post:
 *    tags:
 *      - Autenticação
 *    summary: Registra novo usuário
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Usuario'
 *    responses:
 *     201:
 *        description: Objeto de login
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Login'
 *     400:
 *        description: Objeto de validação
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.post('/registrar', async (req, res) => {
  const { email, nome, sobrenome, senha } = req.body;

  const usuarios = {
    email,
    nome,
    sobrenome,
    senha,
  };

  const usuario = await Usuario.findOne({ email: email });

  if (usuario) {
    return res.status(400).json({ message: 'E-mail já cadastrado.' });
  }

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório!' });
  } else if (!validarEmail(email)) {
    return res.status(400).json({ message: 'E-mail inválido!' });
  } else if (!nome) {
    return res.status(400).json({ message: 'Nome é obrigatório!' });
  } else if (!senha) {
    return res.status(400).json({ message: 'Senha é obrigatória!' });
  }

  bcrypt.hash(senha, 10, async function (err, hash) {
    if (err) {
      return res.status(500).json({ message: err });
    } else {
      usuarios.senha = hash;

      try {
        const usuarioFromDb = await Usuario.create(usuarios);

        return res.status(200).json({
          _id: usuarioFromDb._id,
          email: usuarioFromDb.email,
          nome: usuarioFromDb.nome,
          sobrenome: usuarioFromDb.sobrenome,
          token: generateToken({
            _id: usuarioFromDb._id,
            email: usuarioFromDb.email,
            nome: usuarioFromDb.nome,
            sobrenome: usuarioFromDb.sobrenome,
          }),
        });
      } catch (error) {
        return res.status(500).json({ message: error });
      }
    }
  });
});

/**
 * @openapi
 * /usuarios/login:
 *  post:
 *    tags:
 *      - Autenticação
 *    summary: Autentica usuário
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Credenciais'
 *    responses:
 *     200:
 *        description: Objeto de login
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Login'
 *     400:
 *        description: Objeto de validação
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'E-mail é obrigatório!' });
  } else if (!validarEmail(email)) {
    return res.status(400).json({ message: 'E-mail inválido!' });
  } else if (!senha) {
    return res.status(400).json({ message: 'Senha é obrigatória!' });
  } else {
    const usuario = await Usuario.findOne({ email: email });

    if (!usuario) {
      return res.status(400).json({ message: 'E-mail não cadastrado!' });
    }

    if (!(await bcrypt.compare(senha, usuario.senha))) {
      return res.status(400).json({ message: 'Senha inválida!' });
    }

    return res.status(200).json({
      _id: usuario._id,
      email: usuario.email,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      token: generateToken({
        _id: usuario._id,
        email: usuario.email,
        nome: usuario.nome,
        sobrenome: usuario.sobrenome,
      }),
    });
  }
});

module.exports = router;
