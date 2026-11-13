import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Populando banco de dados com dados iniciais (seed)...');

  const initialUsers = [
    {
      name: 'Ada Lovelace',
      email: 'ada.lovelace@ufc.br',
      age: 36,
    },
    {
      name: 'Alan Turing',
      email: 'alan.turing@ufc.br',
      age: 41,
    },
    {
      name: 'Grace Hopper',
      email: 'grace.hopper@ufc.br',
      age: 85,
    },
  ];

  for (const user of initialUsers) {
    const upsertedUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
    console.log(`Usuário garantido no banco: ${upsertedUser.name} (${upsertedUser.email})`);
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
