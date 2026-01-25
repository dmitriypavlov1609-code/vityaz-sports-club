import { PrismaClient } from '@prisma/client';

// Создаем единственный экземпляр Prisma Client
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Проверка подключения к базе данных
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Подключение к PostgreSQL успешно установлено');
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n👋 Отключение от базы данных...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('\n👋 Отключение от базы данных...');
  process.exit(0);
});

export default prisma;
