const express = require('express');
const { ErroApi, tratarErros } = require('./lib/erros');
const rotasAuth = require('./rotas/auth');
const rotasFazendas = require('./rotas/fazendas');
const rotasUsuarios = require('./rotas/usuarios');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', rotasAuth);
app.use('/fazendas', rotasFazendas);
app.use('/usuarios', rotasUsuarios);

app.use((req, res, next) => {
  next(new ErroApi(404, 'NAO_ENCONTRADO', 'Recurso não encontrado'));
});

app.use(tratarErros);

module.exports = app;
