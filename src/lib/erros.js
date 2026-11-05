class ErroApi extends Error {
  constructor(status, codigo, mensagem) {
    super(mensagem);
    this.status = status;
    this.codigo = codigo;
  }
}

function tratarErros(err, req, res, next) {
  if (err instanceof ErroApi) {
    return res.status(err.status).json({ codigo: err.codigo, mensagem: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ codigo: 'JSON_INVALIDO', mensagem: 'Corpo da requisição não é um JSON válido' });
  }
  console.error(err);
  return res.status(500).json({ codigo: 'ERRO_INTERNO', mensagem: 'Erro inesperado' });
}

module.exports = { ErroApi, tratarErros };
