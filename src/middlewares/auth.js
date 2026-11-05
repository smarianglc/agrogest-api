const jwt = require('jsonwebtoken');
const { ErroApi } = require('../lib/erros');

function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ErroApi(401, 'RN-03', 'Token de acesso ausente'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id: payload.sub, fazendaId: payload.fazendaId, perfil: payload.perfil };
    return next();
  } catch (erro) {
    const mensagem = erro.name === 'TokenExpiredError' ? 'Token expirado' : 'Token inválido';
    return next(new ErroApi(401, 'RN-03', mensagem));
  }
}

function autorizar(perfisPermitidos, codigo = 'RN-02') {
  return (req, res, next) => {
    if (!perfisPermitidos.includes(req.usuario.perfil)) {
      return next(new ErroApi(403, codigo, 'Seu perfil não tem permissão para este recurso'));
    }
    return next();
  };
}

module.exports = { autenticar, autorizar };
