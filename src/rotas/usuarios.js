const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { ErroApi } = require('../lib/erros');
const { autenticar, autorizar } = require('../middlewares/auth');

const router = express.Router();
const PERFIS = ['ADMIN', 'AGRONOMO', 'FINANCEIRO'];

// O perfil exibido é o do vínculo com a fazenda ativa
function formatar(vinculo) {
  const { usuario } = vinculo;
  return { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: vinculo.perfil, ativo: usuario.ativo && vinculo.ativo };
}

router.use(autenticar, autorizar(['ADMIN'], 'ACESSO_NEGADO'));

router.get('/', async (req, res) => {
  const vinculos = await prisma.vinculo.findMany({
    where: { fazendaId: req.usuario.fazendaId },
    include: { usuario: true },
    orderBy: { usuario: { nome: 'asc' } },
  });
  res.json(vinculos.map(formatar));
});

router.get('/:id', async (req, res) => {
  // RN-01: só encontra quem tem vínculo com a fazenda ativa. De outra fazenda, é como se não existisse.
  const vinculo = await prisma.vinculo.findFirst({
    where: { usuarioId: req.params.id, fazendaId: req.usuario.fazendaId },
    include: { usuario: true },
  });
  if (!vinculo) {
    throw new ErroApi(404, 'RN-01', 'Usuário não encontrado');
  }
  res.json(formatar(vinculo));
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
    // Usuário e vínculo nascem juntos: ou os dois são gravados, ou nenhum
    const vinculo = await prisma.vinculo.create({
      data: {
        perfil,
        fazenda: { connect: { id: req.usuario.fazendaId } },
        usuario: { create: { nome, email, senhaHash: await bcrypt.hash(senha, 10) } },
      },
      include: { usuario: true },
    });
    res.status(201).json(formatar(vinculo));
  } catch (erro) {
    // Duas requisições simultâneas com o mesmo e-mail: o banco barra a segunda
    if (erro.code === 'P2002') {
      throw new ErroApi(409, 'RN-04', 'E-mail já cadastrado');
    }
    throw erro;
  }
});

module.exports = router;
