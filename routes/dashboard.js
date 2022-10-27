var express = require('express');
var router = express.Router();
var Despesa = require('../models/Despesa');
var Receita = require('../models/Receita');
var Categoria = require('../models/Categoria');
var checkToken = require('../middlewares/jwt');

/**
 * @openapi
 * /dashboard/despesas-receitas:
 *  post:
 *    tags:
 *      - Dashboard
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna relação de despesas X receitas no período
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChartParams'
 *    responses:
 *     200:
 *        description: Dados gráficos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ChartData'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.post('/despesas-receitas', checkToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'Data de início é obrigatória.' });
    }

    if (!endDate) {
      return res.status(400).json({ message: 'Data de fim é obrigatória.' });
    }

    const despesas = await Despesa.find({
      usuarioId: req.usuario._id,
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const despesasChartData = {
      group: 'Despesas',
      value: despesas.map(despesa => despesa.valor).reduce((a, b) => a + b, 0),
    };

    const receitas = await Receita.find({
      usuarioId: req.usuario._id,
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const receitasChartData = {
      group: 'Receitas',
      value: receitas.map(receita => receita.valor).reduce((a, b) => a + b, 0),
    };

    return res.status(200).json([despesasChartData, receitasChartData]);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /dashboard/evolucao:
 *  post:
 *    tags:
 *      - Dashboard
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna evolução de despesas e receitas no período
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChartParams'
 *    responses:
 *     200:
 *        description: Dados gráficos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ChartData'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.post('/evolucao', checkToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'Data de início é obrigatória.' });
    }

    if (!endDate) {
      return res.status(400).json({ message: 'Data de fim é obrigatória.' });
    }

    const despesas = await Despesa.find({
      usuarioId: req.usuario._id,
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const despesasChartDataArray = despesas.map(despesa => {
      return { group: 'Despesas', date: despesa.data, value: despesa.valor };
    });

    const receitas = await Receita.find({
      usuarioId: req.usuario._id,
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    const receitasChartDataArray = receitas.map(receita => {
      return { group: 'Receitas', date: receita.data, value: receita.valor };
    });

    return res.status(200).json([...despesasChartDataArray, ...receitasChartDataArray]);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /dashboard/despesas-por-categoria:
 *  post:
 *    tags:
 *      - Dashboard
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna relação de despesas por categoria
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChartParams'
 *    responses:
 *     200:
 *        description: Dados gráficos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ChartData'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.post('/despesas-por-categoria', checkToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'Data de início é obrigatória.' });
    }

    if (!endDate) {
      return res.status(400).json({ message: 'Data de fim é obrigatória.' });
    }

    const despesas = await Despesa.find({
      usuarioId: req.usuario._id,
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    let chartDataArray = [];

    if (despesas.length > 0) {
      chartDataArray = Array.from(
        new Set(despesas.filter(despesa => despesa.categoriaNome).map(despesa => despesa.categoriaNome))
      ).map(categoria => {
        return {
          group: categoria,
          value: 0,
        };
      });

      chartDataArray.forEach(data => {
        data.value = despesas
          .filter(despesa => despesa.categoriaNome === data.group)
          .map(despesa => despesa.valor)
          .reduce((a, b) => a + b, 0);
      });

      chartDataArray.push({
        group: 'Não informada',
        value: despesas
          .filter(despesa => !despesa.categoriaNome)
          .map(despesa => despesa.valor)
          .reduce((a, b) => a + b, 0),
      });
    }

    return res.status(200).json(chartDataArray);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

/**
 * @openapi
 * /dashboard/receitas-por-categoria:
 *  post:
 *    tags:
 *      - Dashboard
 *    security:
 *      - bearerAuth: []
 *    summary: Retorna relação de receitas por categoria
 *    requestBody:
 *      content:
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/ChartParams'
 *    responses:
 *     200:
 *        description: Dados gráficos
 *        content:
 *          application/json:
 *            schema:
 *              type: array
 *              items:
 *                $ref: '#/components/schemas/ChartData'
 *     500:
 *        description: Objeto de retorno
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Retorno'
 */
router.post('/receitas-por-categoria', checkToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate) {
      return res.status(400).json({ message: 'Data de início é obrigatória.' });
    }

    if (!endDate) {
      return res.status(400).json({ message: 'Data de fim é obrigatória.' });
    }

    const receitas = await Receita.find({
      usuarioId: req.usuario._id,
      data: {
        $gte: startDate,
        $lte: endDate,
      },
    });

    let chartDataArray = [];

    if (receitas.length > 0) {
      chartDataArray = Array.from(
        new Set(receitas.filter(receita => receita.categoriaNome).map(receita => receita.categoriaNome))
      ).map(categoria => {
        return {
          group: categoria,
          value: 0,
        };
      });

      chartDataArray.forEach(data => {
        data.value = receitas
          .filter(receita => receita.categoriaNome === data.group)
          .map(receita => receita.valor)
          .reduce((a, b) => a + b, 0);
      });

      chartDataArray.push({
        group: 'Não informada',
        value: receitas
          .filter(receita => !receita.categoriaNome)
          .map(receita => receita.valor)
          .reduce((a, b) => a + b, 0),
      });
    }

    return res.status(200).json(chartDataArray);
  } catch (error) {
    return res.status(500).json({ message: error });
  }
});

module.exports = router;
