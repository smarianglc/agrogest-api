const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');
const { autenticar } = require('../middlewares/auth');

const router = express.Router();

function gerarToken(usuarioId, vinculo) {
  return jwt.sign(
    { fazendaId: vinculo.fazendaId, perfil: vinculo.perfil },
    process.env.JWT_SECRET,
    { subject: usuarioId, expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
  );
}

function listarFazendas(vinculos) {
  return vinculos.map((v) => ({ id: v.fazendaId, nome: v.fazenda.nome, perfil: v.perfil }));
}

const VINCULOS_ATIVOS = {
  where: { ativo: true },
  include: { fazenda: { select: { nome: true } } },
  orderBy: { criadoEm: 'asc' },
};

router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const senha = String(req.body?.senha || '');

  if (!email || !senha) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe e-mail e senha');
  }

  const usuario = await prisma.usuario.findUnique({ where: { email }, include: { vinculos: VINCULOS_ATIVOS } });
  const senhaConfere = usuario && (await bcrypt.compare(senha, usuario.senhaHash));

  // Mesma resposta para e-mail inexistente, senha errada e usuário sem vínculo ativo
  if (!senhaConfere || !usuario.ativo || usuario.vinculos.length === 0) {
    throw new ErroApi(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos');
  }

  const vinculo = usuario.vinculos[0];

  res.json({
    token: gerarToken(usuario.id, vinculo),
    usuario: { id: usuario.id, nome: usuario.nome, perfil: vinculo.perfil, fazendaId: vinculo.fazendaId },
    fazendas: listarFazendas(usuario.vinculos),
  });
});

// RN-21: troca de fazenda
router.post('/trocar-fazenda', autenticar, async (req, res) => {
  const fazendaId = String(req.body?.fazendaId || '');

  const vinculo = await prisma.vinculo.findFirst({
    where: { usuarioId: req.usuario.id, fazendaId, ativo: true, usuario: { ativo: true } },
  });

  // Sem vínculo: 404, para não revelar que a fazenda existe
  if (!vinculo) {
    throw new ErroApi(404, 'RN-21', 'Fazenda não encontrada');
  }

  res.json({
    token: gerarToken(req.usuario.id, vinculo),
    fazendaId: vinculo.fazendaId,
    perfil: vinculo.perfil,
  });
});

module.exports = router;
