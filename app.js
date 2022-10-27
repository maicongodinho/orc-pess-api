var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

require('dotenv').config();

var swaggerUi = require('swagger-ui-express');
var swaggerJsDoc = require('swagger-jsdoc');
var swaggerDefinitions = require('./swagger.json');

var indexRouter = require('./routes/index');
var usuariosRouter = require('./routes/usuarios');
var categoriasRouter = require('./routes/categorias');
var receitasRouter = require('./routes/receitas');
var despesasRouter = require('./routes/despesas');
var dashboardRouter = require('./routes/dashboard');

var app = express();

app.use(cors());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/usuarios', usuariosRouter);
app.use('/categorias', categoriasRouter);
app.use('/receitas', receitasRouter);
app.use('/despesas', despesasRouter);
app.use('/dashboard', dashboardRouter);

const swaggerDocs = swaggerJsDoc({
  definition: swaggerDefinitions,
  apis: ['./routes/*'],
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(function (_req, _res, next) {
  next(createError(404));
});

app.use(function (err, req, res, _next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
