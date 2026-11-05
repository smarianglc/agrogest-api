const fs = require('fs');
const path = require('path');
const express = require('express');
const YAML = require('yaml');
const swaggerUi = require('swagger-ui-express');
const { ErroApi, tratarErros } = require('./lib/erros');
const rotasAuth = require('./rotas/auth');
const rotasFazendas = require('./rotas/fazendas');
const rotasUsuarios = require('./rotas/usuarios');
const rotasInsumos = require('./rotas/insumos');
const rotasEntradasNota = require('./rotas/entradas-nota');

const openapi = YAML.parse(
  fs.readFileSync(path.join(__dirname, '..', 'docs', 'openapi.yaml'), 'utf8'),
);

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));
app.get('/openapi.json', (req, res) => res.json(openapi));

app.use('/auth', rotasAuth);
app.use('/fazendas', rotasFazendas);
app.use('/usuarios', rotasUsuarios);
app.use('/insumos', rotasInsumos);
app.use('/entradas-nota', rotasEntradasNota);

app.use((req, res, next) => {
  next(new ErroApi(404, 'NAO_ENCONTRADO', 'Recurso não encontrado'));
});

app.use(tratarErros);

module.exports = app;
