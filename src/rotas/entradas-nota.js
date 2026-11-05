const express = require('express');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');
const { Decimal, lerDecimal } = require('../lib/decimal');
const { formatarInsumo, formatarEntrada } = require('../lib/formatadores');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();
const DATA_ISO = /^\d{4}-\d{2}-\d{2}$/;

// RN-02: a nota gera contas a pagar, então é do financeiro
router.use(autenticar, autorizar(['ADMIN', 'FINANCEIRO'], 'RN-02'));

router.get('/', async (req, res) => {
  const entradas = await prisma.entradaNota.findMany({
    where: { fazendaId: req.usuario.fazendaId },
    orderBy: { criadoEm: 'desc' },
  });
  res.json(entradas.map(formatarEntrada));
});

router.post('/', async (req, res) => {
  const { insumoId, dataEmissao } = req.body ?? {};
  const numeroNota = String(req.body?.numeroNota || '').trim();
  const fornecedor = String(req.body?.fornecedor || '').trim();
  const numeroParcelas = req.body?.numeroParcelas ?? 1;

  if (typeof insumoId !== 'string' || !numeroNota || !fornecedor) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe insumoId, numeroNota e fornecedor');
  }
  if (!DATA_ISO.test(String(dataEmissao)) || Number.isNaN(Date.parse(dataEmissao))) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe dataEmissao no formato AAAA-MM-DD');
  }
  // A faixa de 1 a 12 parcelas (RN-14) entra na v0.2, junto com o financeiro
  if (!Number.isInteger(numeroParcelas)) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'numeroParcelas deve ser um número inteiro');
  }

  const quantidade = lerDecimal(req.body?.quantidade, 'quantidade', 3);
  const valorTotal = lerDecimal(req.body?.valorTotal, 'valorTotal', 2);

  // RN-06
  if (quantidade.lte(0) || valorTotal.lte(0)) {
    throw new ErroApi(422, 'RN-06', 'Quantidade e valor da nota devem ser maiores que zero');
  }

  const fazendaId = req.usuario.fazendaId;

  // Nota e saldo mudam juntos: se qualquer passo falhar, nada é gravado
  const resultado = await prisma.$transaction(async (tx) => {
    // Trava a linha do insumo até o fim da transação (evita duas notas simultâneas calcularem sobre o mesmo saldo)
    const travado = await tx.$queryRaw`
      SELECT id FROM "Insumo" WHERE id = ${insumoId} AND "fazendaId" = ${fazendaId} FOR UPDATE
    `;
    if (travado.length === 0) {
      throw new ErroApi(404, 'RN-01', 'Insumo não encontrado');
    }

    const insumo = await tx.insumo.findUnique({ where: { id: insumoId } });

    // RN-05: custo médio ponderado
    const valorDoSaldo = insumo.saldo.times(insumo.custoMedio);
    const novoSaldo = insumo.saldo.plus(quantidade);
    const novoCustoMedio = valorDoSaldo
      .plus(valorTotal)
      .div(novoSaldo)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);

    const entrada = await tx.entradaNota.create({
      data: {
        fazendaId,
        insumoId,
        numeroNota,
        fornecedor,
        quantidade,
        valorTotal,
        dataEmissao: new Date(dataEmissao),
        numeroParcelas,
      },
    });

    const insumoAtualizado = await tx.insumo.update({
      where: { id: insumoId },
      data: { saldo: novoSaldo, custoMedio: novoCustoMedio },
    });

    return { entrada, insumoAtualizado };
  });

  res.status(201).json({
    entrada: formatarEntrada(resultado.entrada),
    insumo: formatarInsumo(resultado.insumoAtualizado),
  });
});

module.exports = router;
