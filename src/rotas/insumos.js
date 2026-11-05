const express = require('express');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');
const { lerDecimal } = require('../lib/decimal');
const { bugAtivo } = require('../lib/bugs');
const { formatarInsumo } = require('../lib/formatadores');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();
const CATEGORIAS = ['SEMENTE', 'FERTILIZANTE', 'DEFENSIVO'];
const UNIDADES = ['KG', 'L', 'SC'];

router.use(autenticar);

router.get('/', async (req, res) => {
  const filtro = { fazendaId: req.usuario.fazendaId };

  // BUG-01 (viola RN-01): com o bug ligado, a listagem perde o filtro de fazenda
  if (bugAtivo('BUG-01')) {
    delete filtro.fazendaId;
  }

  const insumos = await prisma.insumo.findMany({ where: filtro, orderBy: { nome: 'asc' } });
  let lista = insumos.map(formatarInsumo);

  if (req.query.alerta === 'true') {
    lista = lista.filter((insumo) => insumo.emAlerta);
  }

  res.json(lista);
});

router.get('/:id', async (req, res) => {
  const insumo = await prisma.insumo.findFirst({
    where: { id: req.params.id, fazendaId: req.usuario.fazendaId },
  });
  if (!insumo) {
    throw new ErroApi(404, 'RN-01', 'Insumo não encontrado');
  }
  res.json(formatarInsumo(insumo));
});

router.post('/', autorizar(['ADMIN', 'FINANCEIRO'], 'ACESSO_NEGADO'), async (req, res) => {
  const nome = String(req.body?.nome || '').trim();
  const { categoria, unidade } = req.body ?? {};

  if (!nome || !CATEGORIAS.includes(categoria) || !UNIDADES.includes(unidade)) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe nome, uma categoria válida e uma unidade válida');
  }

  // Opcionais: identificam o produto para o agrônomo
  const especificacao = req.body?.especificacao ? String(req.body.especificacao).trim() : null;
  const lote = req.body?.lote ? String(req.body.lote).trim() : null;
  const validadeTexto = req.body?.validade;
  if (validadeTexto && (!/^\d{4}-\d{2}-\d{2}$/.test(String(validadeTexto)) || Number.isNaN(Date.parse(validadeTexto)))) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe a validade no formato AAAA-MM-DD');
  }
  const validade = validadeTexto ? new Date(validadeTexto) : null;

  const estoqueMinimo = lerDecimal(req.body?.estoqueMinimo ?? 0, 'estoqueMinimo', 3);
  if (estoqueMinimo.lt(0)) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'O estoque mínimo não pode ser negativo');
  }

  // Saldo e custo médio nascem zerados: só mudam por entrada de nota (RN-05)
  const insumo = await prisma.insumo.create({
    data: { nome, categoria, unidade, especificacao, lote, validade, estoqueMinimo, fazendaId: req.usuario.fazendaId },
  });

  res.status(201).json(formatarInsumo(insumo));
});

module.exports = router;
