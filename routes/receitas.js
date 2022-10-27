var express = require('express');
var router = express.Router();
var Receita = require('../models/Receita');
var Categoria = require('../models/Categoria');
var checkToken = require('../middlewares/jwt');
var verifyIdParamIntegrity = require('../middlewares/id-param');

/**
 * @openapi
 * /receitas:
 *  get:
 *    tags:
 *      - Receitas
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna todas as receitas
 *    responses:
 *     200:
 *        description: Lista de receitas
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ReceitaDb'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.get('/', checkToken, async (req, res) => {
  try {
    return res.status(200).json(await Receita.find({ usuarioId: req.usuario._id }));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /receitas/{receitaId}:
 *  get:
 *    tags:
 *      - Receitas
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna uma receita
 *    parameters:
 *      - in: path
 *        name: receitaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da receita
 *    responses:
 *     200:
 *        description: Receita
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ReceitaDb'
 *     400:
 *        description: Objeto de retorno
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
router.get('/:id', checkToken, verifyIdParamIntegrity, async (req, res) => {
  try {
    const receita = await Receita.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!receita) {
      return res.status(400).json({ message: 'Receita não encontrada.' });
    }

    return res.status(200).json(receita);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /receitas:
 *  post:
 *    tags:
 *      - Receitas
 *    security:
 *      - bearerAuth: []
 *    summary: Insere uma nova receita
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Receita'
 *    responses:
 *     200:
 *        description: Nova receita
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ReceitaDb'
 *     400:
 *        description: Objeto de retorno
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
router.post('/', checkToken, async (req, res) => {
  try {
    const { data, valor, descricao, categoriaId } = req.body;

    if (!data) {
      return res.status(400).json({ message: 'Data é obrigatória!' });
    } else if (!valor) {
      return res.status(400).json({ message: 'Valor é obrigatório!' });
    }

    const receita = {
      data,
      valor,
      descricao,
      usuarioId: req.usuario._id,
    };

    if (categoriaId) {
      const categoria = await Categoria.findOne({
        usuarioId: req.usuario._id,
        _id: categoriaId,
      });

      if (!categoria) {
        return res.status(400).json({ message: 'Categoria não encontrada.' });
      }

      receita.categoriaId = categoria._id;
      receita.categoriaNome = categoria.nome;
    } else {
      receita.categoriaId = '';
      receita.categoriaNome = '';
    }

    return res.status(201).json(await Receita.create(receita));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /receitas/{receitaId}:
 *  put:
 *    tags:
 *      - Receitas
 *    security:
 *      - bearerAuth: []
 *    summary: Atualiza uma receita
 *    parameters:
 *      - in: path
 *        name: receitaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da receita
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Receita'
 *    responses:
 *     200:
 *        description: Receita atualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ReceitaDb'
 *     400:
 *        description: Objeto de retorno
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
router.put('/:id', checkToken, verifyIdParamIntegrity, async (req, res) => {
  try {
    const receita = await Receita.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!receita) {
      return res.status(400).json({ message: 'Receita não encontrada.' });
    }

    const { data, valor, descricao, categoriaId } = req.body;

    if (!data) {
      return res.status(400).json({ message: 'Data é obrigatória!' });
    } else if (!valor) {
      return res.status(400).json({ message: 'Valor é obrigatório!' });
    }

    if (categoriaId) {
      const categoria = await Categoria.findOne({
        usuarioId: req.usuario._id,
        _id: categoriaId,
      });

      if (!categoria) {
        return res.status(400).json({ message: 'Categoria não encontrada.' });
      }

      receita.categoriaId = categoria._id;
      receita.categoriaNome = categoria.nome;
    } else {
      receita.categoriaId = '';
      receita.categoriaNome = '';
    }

    receita.data = data;
    receita.valor = valor;
    receita.descricao = descricao;
    receita.categoriaId = categoriaId;

    delete receita._id;
    delete receita._rev;

    await Receita.updateOne({ _id: req.params.id }, receita);

    return res.status(200).json(receita);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /receitas/{receitaId}:
 *  delete:
 *    tags:
 *      - Receitas
 *    security:
 *      - bearerAuth: []
 *    summary: Deleta uma receita
 *    parameters:
 *      - in: path
 *        name: receitaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da receita
 *    responses:
 *     200:
 *        description: Receita
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ReceitaDb'
 *     400:
 *        description: Objeto de retorno
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
router.delete('/:id', checkToken, verifyIdParamIntegrity, async (req, res) => {
  try {
    const receita = await Receita.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!receita) {
      return res.status(400).json({ message: 'Receita não encontrada.' });
    }

    await Receita.deleteOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    return res.status(200).json(receita);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
