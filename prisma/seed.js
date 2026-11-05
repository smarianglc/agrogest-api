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
    insumos: [
      // Exemplo oficial do RN-05: 10.000 kg a R$ 3,00 (ureia fica para o milho 2ª safra)
      { nome: 'Ureia', categoria: 'FERTILIZANTE', unidade: 'KG', especificacao: '45% N', lote: 'U-0412', saldo: '10000.000', custoMedio: '3.00', estoqueMinimo: '5000.000' },
      // Fertilizante da soja (exemplo do RN-10)
      { nome: 'Cloreto de potássio (KCl)', categoria: 'FERTILIZANTE', unidade: 'KG', especificacao: '60% K2O', lote: 'K-0931', saldo: '60000.000', custoMedio: '3.10', estoqueMinimo: '20000.000' },
      // Já nasce em alerta (RN-07): 1.200 L, mínimo de 1.500 L
      { nome: 'Herbicida glifosato', categoria: 'DEFENSIVO', unidade: 'L', especificacao: 'Glifosato 480 g/L (produto fictício)', lote: 'L-2611', validade: new Date('2027-08-31'), saldo: '1200.000', custoMedio: '28.00', estoqueMinimo: '1500.000' },
      // Também em alerta: saldo zero, mínimo de 40 sacos
      { nome: 'Semente de soja AG 61', categoria: 'SEMENTE', unidade: 'SC', especificacao: 'Cultivar fictícia, saco de 5 milhões de sementes', lote: 'S-1207', saldo: '0.000', custoMedio: '0.00', estoqueMinimo: '40.000' },
    ],
  },
  {
    nome: 'Fazenda Rio Verde',
    cidade: 'Sidrolândia',
    areaTotalHa: '2500.00',
    // A Juliana atende as duas fazendas: é ela que prova a troca de fazenda (RN-21)
    vinculos: [['helena', 'ADMIN'], ['tiago', 'AGRONOMO'], ['sandra', 'FINANCEIRO'], ['juliana', 'AGRONOMO']],
    insumos: [
      // Só existe na Rio Verde: se aparecer para a Boa Safra, é vazamento (BUG-01)
      { nome: 'Semente de milho MX 30', categoria: 'SEMENTE', unidade: 'SC', especificacao: 'Cultivar fictícia, saco de 60 mil sementes', lote: 'M-0315', saldo: '8.000', custoMedio: '1150.00', estoqueMinimo: '10.000' },
    ],
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

  for (const { vinculos, insumos, ...fazenda } of FAZENDAS) {
    await prisma.fazenda.create({
      data: {
        ...fazenda,
        vinculos: {
          create: vinculos.map(([chave, perfil]) => ({ perfil, usuario: { connect: { id: ids[chave] } } })),
        },
        insumos: { create: insumos },
      },
    });
  }

  console.log('Seed concluído: 2 fazendas, 6 usuários, 7 vínculos, 5 insumos.');
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
