import { prisma } from '../src/config/prisma.js';
import request from 'supertest';
import { app } from '../src/app.js';

async function runTests() {
  console.log('====================================================');
  console.log('  TESTE DE MIGRAÇÃO E DADOS DO BANCO (GITHUB ACTIONS)');
  console.log('====================================================\n');

  try {
    // 1. Testar conexão com o banco
    console.log('[1/5] Testando conexão com PostgreSQL...');
    await prisma.$connect();
    console.log('  ✓ Conexão bem-sucedida!\n');

    // 2. Testar estrutura da tabela (migrations)
    console.log('[2/5] Testando estrutura da tabela users (validação de migrations)...');
    const tableColumns = await prisma.$queryRaw<
      Array<{ column_name: string; data_type: string }>
    >`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;

    if (tableColumns.length === 0) {
      throw new Error("Tabela 'users' não foi encontrada! O migration não foi executado corretamente.");
    }

    const columnNames = tableColumns.map((c) => c.column_name);
    console.log(`  Colunas encontradas na tabela 'users': ${columnNames.join(', ')}`);

    const expectedColumns = ['id', 'name', 'email', 'age', 'createdAt', 'updatedAt'];
    for (const col of expectedColumns) {
      if (!columnNames.includes(col)) {
        throw new Error(`Coluna obrigatória '${col}' não existe na tabela 'users'!`);
      }
    }
    console.log('  ✓ Estrutura da tabela validada com sucesso!\n');

    // 3. Testar dados do banco (seed / records)
    console.log('[3/5] Testando dados pré-existentes / seed no banco...');
    const userCount = await prisma.user.count();
    console.log(`  Total de usuários no banco: ${userCount}`);
    if (userCount === 0) {
      console.warn('  ⚠ Nenhum dado encontrado. Certifique-se de executar o seed!');
    } else {
      const sample = await prisma.user.findFirst();
      console.log(`  Exemplo de registro encontrado: ${sample?.name} (${sample?.email})`);
      console.log('  ✓ Verificação de dados concluída!\n');
    }

    // 4. Testar operações CRUD via Prisma
    console.log('[4/5] Testando operações CRUD com Prisma...');
    const testEmail = `test_${Date.now()}@test.com`;
    const createdUser = await prisma.user.create({
      data: {
        name: 'CI Pipeline User',
        email: testEmail,
        age: 25,
      },
    });
    console.log(`  ✓ CREATE: Usuário id=${createdUser.id} criado com sucesso.`);

    const foundUser = await prisma.user.findUnique({
      where: { id: createdUser.id },
    });
    if (!foundUser || foundUser.email !== testEmail) {
      throw new Error('READ falhou: Usuário criado não pôde ser recuperado.');
    }
    console.log('  ✓ READ: Usuário recuperado corretamente.');

    const updatedUser = await prisma.user.update({
      where: { id: createdUser.id },
      data: { age: 26 },
    });
    if (updatedUser.age !== 26) {
      throw new Error('UPDATE falhou: Idade não foi atualizada.');
    }
    console.log('  ✓ UPDATE: Usuário atualizado com sucesso.');

    await prisma.user.delete({
      where: { id: createdUser.id },
    });
    console.log('  ✓ DELETE: Usuário de teste removido com sucesso.\n');

    // 5. Testar endpoints HTTP da API Express
    console.log('[5/5] Testando endpoints Express via Supertest...');
    const healthRes = await request(app).get('/health');
    if (healthRes.status !== 200 || healthRes.body.status !== 'ok') {
      throw new Error(`Endpoint /health retornou erro: status ${healthRes.status}`);
    }
    console.log('  ✓ Endpoint GET /health retornou 200 OK.');

    const usersRes = await request(app).get('/api/users');
    if (usersRes.status !== 200 || !Array.isArray(usersRes.body)) {
      throw new Error(`Endpoint GET /api/users retornou resposta inválida: status ${usersRes.status}`);
    }
    console.log(`  ✓ Endpoint GET /api/users retornou 200 OK (${usersRes.body.length} usuários).\n`);

    console.log('====================================================');
    console.log('  TODOS OS TESTES PASSARAM COM SUCESSO! ✓✓✓');
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n✗ ERRO NO TESTE DE MIGRAÇÃO/DADOS:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
