const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');

const router = express.Router();

router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const senha = String(req.body?.senha || '');

  if (!email || !senha) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe e-mail e senha');
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const senhaConfere = usuario && (await bcrypt.compare(senha, usuario.senhaHash));

  // Mesma resposta para e-mail inexistente e senha errada: não revela quais e-mails existem
  if (!senhaConfere || !usuario.ativo) {
    throw new ErroApi(401, 'CREDENCIAIS_INVALIDAS', 'E-mail ou senha inválidos');
  }

  const token = jwt.sign(
    { fazendaId: usuario.fazendaId, perfil: usuario.perfil },
    process.env.JWT_SECRET,
    { subject: usuario.id, expiresIn: process.env.JWT_EXPIRES_IN || '1h' },
  );

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil, fazendaId: usuario.fazendaId },
  });
});

module.exports = router;
