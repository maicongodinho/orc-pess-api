var express = require('express');
var router = express.Router();
var Despesa = require('../models/Despesa');
var Categoria = require('../models/Categoria');
var checkToken = require('../middlewares/jwt');
var verifyIdParamIntegrity = require('../middlewares/id-param');

/**
 * @openapi
 * /despesas:
 *  get:
 *    tags:
 *      - Despesas
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna todas as despesas
 *    responses:
 *     200:
 *        description: Lista de despesas
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
    return res.status(200).json(await Despesa.find({ usuarioId: req.usuario._id }));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /despesas/{receitaId}:
 *  get:
 *    tags:
 *      - Despesas
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna uma despesa
 *    parameters:
 *      - in: path
 *        name: receitaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da despesa
 *    responses:
 *     200:
 *        description: Despesa
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
    const despesa = await Despesa.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!despesa) {
      return res.status(400).json({ message: 'Despesa não encontrada.' });
    }

    return res.status(200).json(despesa);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /despesas:
 *  post:
 *    tags:
 *      - Despesas
 *    security:
 *      - bearerAuth: []
 *    summary: Insere uma nova despesa
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Despesa'
 *    responses:
 *     200:
 *        description: Nova despesa
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

    const despesa = {
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

      despesa.categoriaId = categoria._id;
      despesa.categoriaNome = categoria.nome;
    } else {
      despesa.categoriaId = '';
      despesa.categoriaNome = '';
    }

    return res.status(201).json(await Despesa.create(despesa));
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /despesas/{receitaId}:
 *  put:
 *    tags:
 *      - Despesas
 *    security:
 *      - bearerAuth: []
 *    summary: Atualiza uma despesa
 *    parameters:
 *      - in: path
 *        name: receitaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da despesa
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Despesa'
 *    responses:
 *     200:
 *        description: Despesa atualizada
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
    const despesa = await Despesa.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!despesa) {
      return res.status(400).json({ message: 'Despesa não encontrada.' });
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

      despesa.categoriaId = categoria._id;
      despesa.categoriaNome = categoria.nome;
    } else {
      despesa.categoriaId = '';
      despesa.categoriaNome = '';
    }

    despesa.data = data;
    despesa.valor = valor;
    despesa.descricao = descricao;

    delete despesa._id;
    delete despesa._rev;

    await Despesa.updateOne({ _id: req.params.id }, despesa);

    return res.status(200).json(despesa);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /despesas/{receitaId}:
 *  delete:
 *    tags:
 *      - Despesas
 *    security:
 *      - bearerAuth: []
 *    summary: Deleta uma despesa
 *    parameters:
 *      - in: path
 *        name: receitaId
 *        schema:
 *          type: string
 *        required: true
 *        description: Identificador da despesa
 *    responses:
 *     200:
 *        description: Despesa
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
    const despesa = await Despesa.findOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    if (!despesa) {
      return res.status(400).json({ message: 'Despesa não encontrada.' });
    }

    await Despesa.deleteOne({
      usuarioId: req.usuario._id,
      _id: req.params.id,
    });

    return res.status(200).json(despesa);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
