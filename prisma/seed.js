const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Senha fictícia, usada só em ambiente local e de testes
const SENHA_PADRAO = 'Agro@2026';

const USUARIOS = {
  roberto: { nome: 'Roberto', email: 'roberto@boasafra.test' },
  juliana: { nome: 'Juliana', email: 'juliana@agrogest.test' },
  carlos: { nome: 'Carlos', email: 'carlos@boasafra.test' },
  helena: { nome: 'Helena', email: 'helena@rioverde.test' },
  tiago: { nome: 'Tiago', email: 'tiago@rioverde.test' },
  sandra: { nome: 'Sandra', email: 'sandra@rioverde.test' },
};

const FAZENDAS = [
  {
    nome: 'Fazenda Boa Safra',
    cidade: 'Dourados',
    areaTotalHa: '1200.00',
    vinculos: [['roberto', 'ADMIN'], ['juliana', 'AGRONOMO'], ['carlos', 'FINANCEIRO']],
  },
  {
    nome: 'Fazenda Rio Verde',
    cidade: 'Sidrolândia',
    areaTotalHa: '2500.00',
    // A Juliana atende as duas fazendas: é ela que prova a troca de fazenda (RN-21)
    vinculos: [['helena', 'ADMIN'], ['tiago', 'AGRONOMO'], ['sandra', 'FINANCEIRO'], ['juliana', 'AGRONOMO']],
  },
];

async function main() {
  // Apaga na ordem inversa das dependências
  await prisma.entradaNota.deleteMany();
  await prisma.insumo.deleteMany();
  await prisma.vinculo.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.fazenda.deleteMany();

  const senhaHash = await bcrypt.hash(SENHA_PADRAO, 10);

  const ids = {};
  for (const [chave, dados] of Object.entries(USUARIOS)) {
    const usuario = await prisma.usuario.create({ data: { ...dados, senhaHash } });
    ids[chave] = usuario.id;
  }

  for (const { vinculos, ...fazenda } of FAZENDAS) {
    await prisma.fazenda.create({
      data: {
        ...fazenda,
        vinculos: {
          create: vinculos.map(([chave, perfil]) => ({ perfil, usuario: { connect: { id: ids[chave] } } })),
        },
      },
    });
  }

  console.log('Seed concluído: 2 fazendas, 6 usuários, 7 vínculos.');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
