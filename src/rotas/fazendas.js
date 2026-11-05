const express = require('express');
const prisma = require('../lib/prisma');
const { autenticar } = require('../middlewares/auth');

const router = express.Router();

router.use(autenticar);

// Dados da fazenda do usuário logado (todos os perfis)
router.get('/atual', async (req, res) => {
  const fazenda = await prisma.fazenda.findUnique({ where: { id: req.usuario.fazendaId } });
  res.json(fazenda);
});

module.exports = router;
