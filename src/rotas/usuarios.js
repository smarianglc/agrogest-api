const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();
const PERFIS = ['ADMIN', 'AGRONOMO', 'FINANCEIRO'];
const CAMPOS_PUBLICOS = { id: true, nome: true, email: true, perfil: true, ativo: true };

router.use(autenticar, autorizar(['ADMIN'], 'ACESSO_NEGADO'));

router.get('/', async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    where: { fazendaId: req.usuario.fazendaId },
    select: CAMPOS_PUBLICOS,
    orderBy: { nome: 'asc' },
  });
  res.json(usuarios);
});

router.get('/:id', async (req, res) => {
  // RN-01: busca pelo id E pela fazenda do token. Se for de outra fazenda, é como se não existisse.
  const usuario = await prisma.usuario.findFirst({
    where: { id: req.params.id, fazendaId: req.usuario.fazendaId },
    select: CAMPOS_PUBLICOS,
  });
  if (!usuario) {
    throw new ErroApi(404, 'RN-01', 'Usuário não encontrado');
  }
  res.json(usuario);
});

router.post('/', async (req, res) => {
  const nome = String(req.body?.nome || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const senha = String(req.body?.senha || '');
  const perfil = req.body?.perfil;

  if (!nome || !email || senha.length < 8 || !PERFIS.includes(perfil)) {
    throw new ErroApi(422, 'DADOS_INVALIDOS', 'Informe nome, e-mail, senha (mínimo 8 caracteres) e um perfil válido');
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new ErroApi(409, 'RN-04', 'E-mail já cadastrado');
  }

  try {
    const novo = await prisma.usuario.create({
      data: { nome, email, perfil, senhaHash: await bcrypt.hash(senha, 10), fazendaId: req.usuario.fazendaId },
      select: CAMPOS_PUBLICOS,
    });
    res.status(201).json(novo);
  } catch (erro) {
    // Duas requisições simultâneas com o mesmo e-mail: o banco barra a segunda
    if (erro.code === 'P2002') {
      throw new ErroApi(409, 'RN-04', 'E-mail já cadastrado');
    }
    throw erro;
  }
});

module.exports = router;
