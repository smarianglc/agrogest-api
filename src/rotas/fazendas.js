const express = require('express');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');
const { formatarFazenda } = require('../lib/formatadores');
const { autenticar } = require('../middlewares/auth');

const router = express.Router();

router.use(autenticar);

// Dados da fazenda do usuário logado (todos os perfis)
router.get('/atual', async (req, res) => {
  const fazenda = await prisma.fazenda.findUnique({ where: { id: req.usuario.fazendaId } });
  if (!fazenda) {
    throw new ErroApi(404, 'RN-01', 'Fazenda não encontrada');
  }
  // Decimais saem como texto com casas fixas, como no restante do contrato
  res.json(formatarFazenda(fazenda));
});

module.exports = router;
