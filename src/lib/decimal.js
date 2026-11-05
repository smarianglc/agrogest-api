const { Prisma } = require('@prisma/client');
const { ErroApi } = require('./erros');

const Decimal = Prisma.Decimal;

// Converte o valor recebido no corpo da requisição para Decimal, validando o formato
function lerDecimal(valor, campo, casasMaximas) {
  if (valor === undefined || valor === null || valor === '') {
    throw new ErroApi(422, 'DADOS_INVALIDOS', `Informe o campo ${campo}`);
  }

  let numero;
  try {
    numero = new Decimal(String(valor));
  } catch {
    throw new ErroApi(422, 'DADOS_INVALIDOS', `O campo ${campo} deve ser um número`);
  }

  if (!numero.isFinite()) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', `O campo ${campo} deve ser um número`);
  }
  if (numero.decimalPlaces() > casasMaximas) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', `O campo ${campo} aceita no máximo ${casasMaximas} casas decimais`);
  }

  return numero;
}

module.exports = { Decimal, lerDecimal };
