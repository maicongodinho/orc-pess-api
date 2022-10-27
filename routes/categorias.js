var express = require('express');
var router = express.Router();
var checkToken = require('../middlewares/jwt');
var verifyIdParamIntegrity = require('../middlewares/id-param');
var Categoria = require('../models/Categoria');
var Despesa = require('../models/Despesa');
var Receita = require('../models/Receita');

/**
 * @openapi
 * /categorias:
 *  get:
 *    tags:
 *      - Categorias
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna todas as categorias
 *    responses:
 *     200:
 *        description: Lista de categorias
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/CategoriaDb'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.get('/', checkToken, async (req, res) => {
  try {
    return res.status(200).json(await Categoria.find({ usuarioId: req.usuario._id }));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /categorias/{categoriaId}:
 *  get:
 *    tags:
 *      - Categorias
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna uma categoria
 *    parameters:
 *      - in: path
 *        name: categoriaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da categoria
 *    responses:
 *     200:
 *        description: Categoria
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CategoriaDb'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.get('/:id', checkToken, verifyIdParamIntegrity, async (req, res) => {
  try {
    const categoria = await Categoria.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!categoria) {
      return res.status(400).json({ message: 'Categoria não encontrada.' });
    }

    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /categorias:
 *  post:
 *    tags:
 *      - Categorias
 *    security:
 *      - bearerAuth: []
 *    summary: Insere uma nova categoria
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Categoria'
 *    responses:
 *     200:
 *        description: Nova categoria
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CategoriaDb'
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
    const { nome, descricao } = req.body;

    const categoria = {
      nome,
      descricao,
      usuarioId: req.usuario._id,
    };

    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório!' });
    }

    return res.status(201).json(await Categoria.create(categoria));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /categorias/{categoriaId}:
 *  put:
 *    tags:
 *      - Categorias
 *    security:
 *      - bearerAuth: []
 *    summary: Atualiza uma categoria
 *    parameters:
 *      - in: path
 *        name: categoriaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da categoria
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Categoria'
 *    responses:
 *     200:
 *        description: Categoria atualizada
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CategoriaDb'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.put('/:id', checkToken, verifyIdParamIntegrity, async (req, res) => {
  try {
    const { nome, descricao } = req.body;

    const categoria = await Categoria.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!categoria) {
      return res.status(400).json({ message: 'Categoria não encontrada.' });
    }

    if (!nome) {
      return res.status(400).json({ message: 'Nome é obrigatório!' });
    }

    categoria.nome = nome;
    categoria.descricao = descricao;

    delete categoria._id;
    delete categoria._rev;

    await Categoria.updateOne({ _id: req.params.id }, categoria);
    await Receita.updateMany({ categoriaId: req.params.id }, { categoriaNome: nome });
    await Despesa.updateMany({ categoriaId: req.params.id }, { categoriaNome: nome });

    return res.status(200).json(categoria);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /categorias/{categoriaId}:
 *  delete:
 *    tags:
 *      - Categorias
 *    security:
 *      - bearerAuth: []
 *    summary: Deleta uma categoria
 *    parameters:
 *      - in: path
 *        name: categoriaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da categoria
 *    responses:
 *     200:
 *        description: Categoria
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/CategoriaDb'
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
    const categoria = await Categoria.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!categoria) {
      return res.status(400).json({ message: 'Categoria não encontrada.' });
    }

    const receita = await Receita.findOne({
      categoriaId: req.params.id,
      usuarioId: req.usuario._id,
    });

    if (receita) {
      return res.status(400).json({ message: 'Categoria possui receitas relacionadas.' });
    }

    const despesa = await Despesa.findOne({
      categoriaId: req.params.id,
      usuarioId: req.usuario._id,
    });

    if (despesa) {
      return res.status(400).json({ message: 'Categoria possui despesas relacionadas.' });
    }

    await Categoria.deleteOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    return res.status(200).json(categoria);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
