const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Senha fictícia, usada só em ambiente local e de testes
const SENHA_PADRAO = 'Agro@2026';

const FAZENDAS = [
  {
    nome: 'Fazenda Boa Safra',
    cidade: 'Dourados',
    areaTotalHa: '1200.00',
    usuarios: [
      { nome: 'Roberto', email: 'roberto@boasafra.test', perfil: 'ADMIN' },
      { nome: 'Juliana', email: 'juliana@boasafra.test', perfil: 'AGRONOMO' },
      { nome: 'Carlos', email: 'carlos@boasafra.test', perfil: 'FINANCEIRO' },
    ],
  },
  {
    nome: 'Fazenda Rio Verde',
    cidade: 'Sidrolândia',
    areaTotalHa: '2500.00',
    usuarios: [
      { nome: 'Helena', email: 'helena@rioverde.test', perfil: 'ADMIN' },
      { nome: 'Tiago', email: 'tiago@rioverde.test', perfil: 'AGRONOMO' },
      { nome: 'Sandra', email: 'sandra@rioverde.test', perfil: 'FINANCEIRO' },
    ],
  },
];

async function main() {
  // Apaga na ordem inversa das dependências
  await prisma.entradaNota.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.fazenda.deleteMany();

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

  for (const { usuarios, ...fazenda } of FAZENDAS) {
    await prisma.fazenda.create({
      data: {
        ...fazenda,
        usuarios: { create: usuarios.map((u) => ({ ...u, senhaHash })) },
      },
    });
  }

  console.log('Seed concluído: 2 fazendas, 6 usuários.');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
