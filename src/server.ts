import dotenv from 'dotenv';
import { app } from './app.js';
import { prisma } from './config/prisma.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Testa a conexão com o PostgreSQL
    await prisma.$connect();
    console.log('✓ Conectado ao banco de dados PostgreSQL com Prisma');

    app.listen(PORT, () => {
      console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Erro ao inicializar o servidor:', error);
    process.exit(1);
  }
}

startServer();
