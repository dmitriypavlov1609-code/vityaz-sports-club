import { PrismaClient, Gender, Role, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем заполнение базы данных...');

  // Очистка базы данных (только для dev)
  await prisma.achievement.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.oFPResult.deleteMany();
  await prisma.session.deleteMany();
  await prisma.child.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.oFPStandard.deleteMany();

  console.log('✅ База данных очищена');

  // Хэширование пароля
  const hashedPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

  // 1. Создание пользователей
  const admin = await prisma.user.create({
    data: {
      email: 'admin@vityazteam.ru',
      password: hashedAdminPassword,
      role: Role.ADMIN,
      firstName: 'Администратор',
      lastName: 'Системы',
      phone: '+79991234567',
    },
  });

  const trainer1User = await prisma.user.create({
    data: {
      email: 'trainer@test.com',
      password: hashedPassword,
      role: Role.TRAINER,
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+79991234568',
    },
  });

  const trainer2User = await prisma.user.create({
    data: {
      email: 'trainer2@test.com',
      password: hashedPassword,
      role: Role.TRAINER,
      firstName: 'Сергей',
      lastName: 'Смирнов',
      phone: '+79991234569',
    },
  });

  const parent1 = await prisma.user.create({
    data: {
      email: 'parent@test.com',
      password: hashedPassword,
      role: Role.PARENT,
      firstName: 'Мария',
      lastName: 'Иванова',
      phone: '+79991234570',
    },
  });

  const parent2 = await prisma.user.create({
    data: {
      email: 'parent2@test.com',
      password: hashedPassword,
      role: Role.PARENT,
      firstName: 'Алексей',
      lastName: 'Сидоров',
      phone: '+79991234571',
    },
  });

  console.log('✅ Пользователи созданы');

  // 2. Создание профилей тренеров
  const trainer1 = await prisma.trainer.create({
    data: {
      userId: trainer1User.id,
      specialization: 'Борьба, ОФП',
      experience: 10,
      bio: 'Мастер спорта по вольной борьбе. 10 лет опыта работы с детьми.',
      certifications: 'МС по вольной борьбе, Тренер 1 категории',
    },
  });

  const trainer2 = await prisma.trainer.create({
    data: {
      userId: trainer2User.id,
      specialization: 'Бокс, ОФП',
      experience: 8,
      bio: 'КМС по боксу. Работаю с детьми всех возрастов.',
      certifications: 'КМС по боксу, Тренер 2 категории',
    },
  });

  console.log('✅ Тренеры созданы');

  // 3. Создание детей
  const child1 = await prisma.child.create({
    data: {
      firstName: 'Александр',
      lastName: 'Иванов',
      middleName: 'Петрович',
      dateOfBirth: new Date('2015-03-15'),
      gender: Gender.MALE,
      parentId: parent1.id,
      trainerId: trainer1.id,
      balance: 12,
      emergencyContact: 'Мама: +79991234570',
      medicalNotes: 'Аллергия на пыльцу',
    },
  });

  const child2 = await prisma.child.create({
    data: {
      firstName: 'Анна',
      lastName: 'Иванова',
      middleName: 'Петровна',
      dateOfBirth: new Date('2017-07-20'),
      gender: Gender.FEMALE,
      parentId: parent1.id,
      trainerId: trainer1.id,
      balance: 8,
      emergencyContact: 'Мама: +79991234570',
    },
  });

  const child3 = await prisma.child.create({
    data: {
      firstName: 'Дмитрий',
      lastName: 'Сидоров',
      middleName: 'Алексеевич',
      dateOfBirth: new Date('2014-11-05'),
      gender: Gender.MALE,
      parentId: parent2.id,
      trainerId: trainer2.id,
      balance: 10,
      emergencyContact: 'Папа: +79991234571',
    },
  });

  const child4 = await prisma.child.create({
    data: {
      firstName: 'Елена',
      lastName: 'Сидорова',
      middleName: 'Алексеевна',
      dateOfBirth: new Date('2016-05-12'),
      gender: Gender.FEMALE,
      parentId: parent2.id,
      trainerId: trainer2.id,
      balance: 5,
      emergencyContact: 'Папа: +79991234571',
    },
  });

  console.log('✅ Дети созданы');

  // 4. Создание тренировок (история)
  const sessionsData = [];
  const now = new Date();

  // Последние 2 месяца тренировок
  for (let i = 60; i > 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Пропускаем выходные
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    // Тренировки для каждого ребенка (3 раза в неделю)
    if (i % 2 === 0) {
      sessionsData.push({
        childId: child1.id,
        trainerId: trainer1.id,
        date: date,
        duration: 90,
        attended: true,
        notes: i % 10 === 0 ? 'Отличная работа на тренировке!' : undefined,
        markedAt: date,
      });
    }

    if (i % 3 === 0) {
      sessionsData.push({
        childId: child2.id,
        trainerId: trainer1.id,
        date: date,
        duration: 60,
        attended: true,
        markedAt: date,
      });
    }

    if (i % 2 === 1) {
      sessionsData.push({
        childId: child3.id,
        trainerId: trainer2.id,
        date: date,
        duration: 90,
        attended: i % 7 !== 0, // Иногда пропускал
        markedAt: date,
      });
    }

    if (i % 3 === 1) {
      sessionsData.push({
        childId: child4.id,
        trainerId: trainer2.id,
        date: date,
        duration: 60,
        attended: true,
        markedAt: date,
      });
    }
  }

  await prisma.session.createMany({
    data: sessionsData,
  });

  console.log(`✅ Создано ${sessionsData.length} тренировок`);

  // 5. Создание результатов ОФП
  // Результаты для ребенка 1 (мальчик, 9 лет) - 3 теста с прогрессом
  await prisma.oFPResult.createMany({
    data: [
      {
        childId: child1.id,
        trainerId: trainer1.id,
        testDate: new Date('2024-09-01'),
        run30m: 6.5,
        run60m: 11.2,
        shuttleRun: 10.5,
        pullUps: 3,
        pushUps: 15,
        press30s: 20,
        longJump: 140,
        flexibility: 5,
        notes: 'Первичное тестирование. Хорошие базовые показатели.',
      },
      {
        childId: child1.id,
        trainerId: trainer1.id,
        testDate: new Date('2024-11-01'),
        run30m: 6.2,
        run60m: 10.8,
        shuttleRun: 10.0,
        pullUps: 5,
        pushUps: 20,
        press30s: 25,
        longJump: 150,
        flexibility: 7,
        notes: 'Заметный прогресс! Продолжаем в том же духе.',
      },
      {
        childId: child1.id,
        trainerId: trainer1.id,
        testDate: new Date('2025-01-15'),
        run30m: 5.9,
        run60m: 10.5,
        shuttleRun: 9.7,
        pullUps: 7,
        pushUps: 25,
        press30s: 28,
        longJump: 160,
        flexibility: 9,
        notes: 'Отличная динамика роста! Все показатели улучшились.',
      },
    ],
  });

  // Результаты для ребенка 2 (девочка, 7 лет) - 2 теста
  await prisma.oFPResult.createMany({
    data: [
      {
        childId: child2.id,
        trainerId: trainer1.id,
        testDate: new Date('2024-10-01'),
        run30m: 7.2,
        shuttleRun: 11.5,
        pushUps: 10,
        press30s: 18,
        longJump: 120,
        flexibility: 12,
        notes: 'Первичное тестирование. Хорошая гибкость!',
      },
      {
        childId: child2.id,
        trainerId: trainer1.id,
        testDate: new Date('2025-01-10'),
        run30m: 6.9,
        shuttleRun: 11.0,
        pushUps: 15,
        press30s: 22,
        longJump: 130,
        flexibility: 14,
        notes: 'Прогресс по всем показателям. Молодец!',
      },
    ],
  });

  // Результаты для ребенка 3 (мальчик, 10 лет) - 2 теста
  await prisma.oFPResult.createMany({
    data: [
      {
        childId: child3.id,
        trainerId: trainer2.id,
        testDate: new Date('2024-09-15'),
        run30m: 5.8,
        run60m: 10.5,
        run100m: 16.5,
        shuttleRun: 9.5,
        pullUps: 8,
        pushUps: 30,
        press30s: 32,
        longJump: 170,
        highJump: 65,
        flexibility: 6,
        ballThrow: 15.5,
        notes: 'Отличные силовые показатели!',
      },
      {
        childId: child3.id,
        trainerId: trainer2.id,
        testDate: new Date('2025-01-20'),
        run30m: 5.5,
        run60m: 10.2,
        run100m: 16.0,
        shuttleRun: 9.2,
        pullUps: 10,
        pushUps: 35,
        press30s: 35,
        longJump: 180,
        highJump: 70,
        flexibility: 8,
        ballThrow: 17.0,
        notes: 'Стабильный рост результатов. Работаем над гибкостью.',
      },
    ],
  });

  console.log('✅ Результаты ОФП созданы');

  // 6. Создание нормативов ОФП по возрастам (на основе ГТО)
  const standards = [
    // Мальчики 6-7 лет
    {
      ageFrom: 6, ageTo: 7, gender: Gender.MALE,
      run30m_min: 7.5, run30m_norm: 6.5, run30m_excel: 5.9,
      shuttleRun_min: 12.0, shuttleRun_norm: 11.0, shuttleRun_excel: 10.0,
      pullUps_min: 1, pullUps_norm: 3, pullUps_excel: 5,
      pushUps_min: 5, pushUps_norm: 10, pushUps_excel: 15,
      press30s_min: 10, press30s_norm: 15, press30s_excel: 20,
      longJump_min: 100, longJump_norm: 120, longJump_excel: 140,
      flexibility_min: 0, flexibility_norm: 5, flexibility_excel: 10,
    },
    // Мальчики 8-9 лет
    {
      ageFrom: 8, ageTo: 9, gender: Gender.MALE,
      run30m_min: 6.8, run30m_norm: 6.0, run30m_excel: 5.4,
      run60m_min: 12.5, run60m_norm: 11.0, run60m_excel: 10.0,
      shuttleRun_min: 11.0, shuttleRun_norm: 10.0, shuttleRun_excel: 9.2,
      pullUps_min: 2, pullUps_norm: 4, pullUps_excel: 7,
      pushUps_min: 10, pushUps_norm: 15, pushUps_excel: 25,
      press30s_min: 15, press30s_norm: 22, press30s_excel: 30,
      longJump_min: 120, longJump_norm: 145, longJump_excel: 165,
      flexibility_min: 2, flexibility_norm: 6, flexibility_excel: 11,
    },
    // Мальчики 10-11 лет
    {
      ageFrom: 10, ageTo: 11, gender: Gender.MALE,
      run30m_min: 6.2, run30m_norm: 5.6, run30m_excel: 5.1,
      run60m_min: 11.5, run60m_norm: 10.5, run60m_excel: 9.5,
      run100m_min: 18.5, run100m_norm: 17.0, run100m_excel: 15.5,
      shuttleRun_min: 10.5, shuttleRun_norm: 9.5, shuttleRun_excel: 8.8,
      pullUps_min: 3, pullUps_norm: 6, pullUps_excel: 10,
      pushUps_min: 15, pushUps_norm: 22, pushUps_excel: 32,
      press30s_min: 20, press30s_norm: 28, press30s_excel: 36,
      longJump_min: 140, longJump_norm: 165, longJump_excel: 185,
      highJump_min: 50, highJump_norm: 65, highJump_excel: 80,
      flexibility_min: 3, flexibility_norm: 7, flexibility_excel: 12,
      ballThrow_min: 12, ballThrow_norm: 16, ballThrow_excel: 20,
    },
    // Мальчики 12-13 лет
    {
      ageFrom: 12, ageTo: 13, gender: Gender.MALE,
      run30m_min: 5.8, run30m_norm: 5.3, run30m_excel: 4.8,
      run60m_min: 10.8, run60m_norm: 9.8, run60m_excel: 8.9,
      run100m_min: 17.5, run100m_norm: 16.0, run100m_excel: 14.5,
      shuttleRun_min: 10.0, shuttleRun_norm: 9.0, shuttleRun_excel: 8.3,
      pullUps_min: 4, pullUps_norm: 8, pullUps_excel: 12,
      pushUps_min: 20, pushUps_norm: 28, pushUps_excel: 38,
      press30s_min: 25, press30s_norm: 33, press30s_excel: 42,
      longJump_min: 160, longJump_norm: 185, longJump_excel: 210,
      highJump_min: 60, highJump_norm: 75, highJump_excel: 90,
      flexibility_min: 4, flexibility_norm: 8, flexibility_excel: 13,
      ballThrow_min: 16, ballThrow_norm: 21, ballThrow_excel: 26,
    },
    // Девочки 6-7 лет
    {
      ageFrom: 6, ageTo: 7, gender: Gender.FEMALE,
      run30m_min: 8.0, run30m_norm: 7.0, run30m_excel: 6.3,
      shuttleRun_min: 12.5, shuttleRun_norm: 11.5, shuttleRun_excel: 10.5,
      pushUps_min: 3, pushUps_norm: 7, pushUps_excel: 12,
      press30s_min: 8, press30s_norm: 13, press30s_excel: 18,
      longJump_min: 90, longJump_norm: 110, longJump_excel: 130,
      flexibility_min: 3, flexibility_norm: 8, flexibility_excel: 13,
    },
    // Девочки 8-9 лет
    {
      ageFrom: 8, ageTo: 9, gender: Gender.FEMALE,
      run30m_min: 7.2, run30m_norm: 6.4, run30m_excel: 5.8,
      run60m_min: 13.0, run60m_norm: 11.5, run60m_excel: 10.5,
      shuttleRun_min: 11.5, shuttleRun_norm: 10.5, shuttleRun_excel: 9.7,
      pushUps_min: 7, pushUps_norm: 12, pushUps_excel: 20,
      press30s_min: 13, press30s_norm: 19, press30s_excel: 26,
      longJump_min: 110, longJump_norm: 135, longJump_excel: 155,
      flexibility_min: 5, flexibility_norm: 10, flexibility_excel: 15,
    },
    // Девочки 10-11 лет
    {
      ageFrom: 10, ageTo: 11, gender: Gender.FEMALE,
      run30m_min: 6.6, run30m_norm: 5.9, run30m_excel: 5.4,
      run60m_min: 12.0, run60m_norm: 11.0, run60m_excel: 10.0,
      run100m_min: 19.5, run100m_norm: 18.0, run100m_excel: 16.5,
      shuttleRun_min: 11.0, shuttleRun_norm: 10.0, shuttleRun_excel: 9.3,
      pushUps_min: 10, pushUps_norm: 16, pushUps_excel: 25,
      press30s_min: 17, press30s_norm: 24, press30s_excel: 32,
      longJump_min: 130, longJump_norm: 150, longJump_excel: 170,
      highJump_min: 45, highJump_norm: 60, highJump_excel: 75,
      flexibility_min: 6, flexibility_norm: 11, flexibility_excel: 16,
      ballThrow_min: 8, ballThrow_norm: 11, ballThrow_excel: 14,
    },
    // Девочки 12-13 лет
    {
      ageFrom: 12, ageTo: 13, gender: Gender.FEMALE,
      run30m_min: 6.2, run30m_norm: 5.6, run30m_excel: 5.1,
      run60m_min: 11.5, run60m_norm: 10.5, run60m_excel: 9.5,
      run100m_min: 18.5, run100m_norm: 17.0, run100m_excel: 15.5,
      shuttleRun_min: 10.5, shuttleRun_norm: 9.5, shuttleRun_excel: 8.8,
      pushUps_min: 13, pushUps_norm: 20, pushUps_excel: 30,
      press30s_min: 20, press30s_norm: 28, press30s_excel: 36,
      longJump_min: 145, longJump_norm: 165, longJump_excel: 185,
      highJump_min: 50, highJump_norm: 65, highJump_excel: 80,
      flexibility_min: 7, flexibility_norm: 12, flexibility_excel: 17,
      ballThrow_min: 10, ballThrow_norm: 13, ballThrow_excel: 17,
    },
  ];

  await prisma.oFPStandard.createMany({ data: standards });
  console.log('✅ Нормативы ОФП созданы');

  // 7. Создание метрик (рост, вес)
  await prisma.metric.createMany({
    data: [
      { childId: child1.id, date: new Date('2024-09-01'), height: 135, weight: 32.5 },
      { childId: child1.id, date: new Date('2025-01-15'), height: 138, weight: 34.0 },
      { childId: child2.id, date: new Date('2024-10-01'), height: 120, weight: 24.0 },
      { childId: child2.id, date: new Date('2025-01-10'), height: 123, weight: 25.5 },
      { childId: child3.id, date: new Date('2024-09-15'), height: 145, weight: 38.0 },
      { childId: child3.id, date: new Date('2025-01-20'), height: 148, weight: 40.0 },
    ],
  });

  console.log('✅ Метрики созданы');

  // 8. Создание платежей
  await prisma.payment.createMany({
    data: [
      {
        userId: parent1.id,
        childId: child1.id,
        amount: 7800,
        currency: 'RUB',
        sessionsCount: 12,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'ukassa',
        packageName: 'Абонемент 12 занятий',
        externalId: 'uk_' + Date.now(),
        createdAt: new Date('2024-12-15'),
      },
      {
        userId: parent1.id,
        childId: child2.id,
        amount: 5600,
        currency: 'RUB',
        sessionsCount: 8,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'ukassa',
        packageName: 'Абонемент 8 занятий',
        externalId: 'uk_' + (Date.now() + 1),
        createdAt: new Date('2024-12-20'),
      },
      {
        userId: parent2.id,
        childId: child3.id,
        amount: 12000,
        currency: 'RUB',
        sessionsCount: 30,
        status: PaymentStatus.COMPLETED,
        paymentMethod: 'ukassa',
        packageName: 'Безлимит месяц',
        externalId: 'uk_' + (Date.now() + 2),
        createdAt: new Date('2025-01-01'),
      },
    ],
  });

  console.log('✅ Платежи созданы');

  // 9. Создание достижений
  await prisma.achievement.createMany({
    data: [
      {
        childId: child1.id,
        title: 'Первая тренировка',
        description: 'Посетил первую тренировку в клубе!',
        icon: '🎯',
        category: 'attendance',
        earnedAt: new Date('2024-09-01'),
      },
      {
        childId: child1.id,
        title: '10 тренировок',
        description: 'Посетил 10 тренировок подряд',
        icon: '🔥',
        category: 'attendance',
        earnedAt: new Date('2024-10-15'),
      },
      {
        childId: child1.id,
        title: 'Прогресс в подтягиваниях',
        description: 'Увеличил количество подтягиваний с 3 до 7!',
        icon: '💪',
        category: 'ofp',
        earnedAt: new Date('2025-01-15'),
      },
      {
        childId: child3.id,
        title: 'Силач',
        description: 'Выполнил 10 подтягиваний',
        icon: '🏋️',
        category: 'ofp',
        earnedAt: new Date('2025-01-20'),
      },
    ],
  });

  console.log('✅ Достижения созданы');

  console.log('\n🎉 Seed данные успешно добавлены!');
  console.log('\n📊 Статистика:');
  console.log(`   Пользователей: ${await prisma.user.count()}`);
  console.log(`   Тренеров: ${await prisma.trainer.count()}`);
  console.log(`   Детей: ${await prisma.child.count()}`);
  console.log(`   Тренировок: ${await prisma.session.count()}`);
  console.log(`   Результатов ОФП: ${await prisma.oFPResult.count()}`);
  console.log(`   Нормативов: ${await prisma.oFPStandard.count()}`);
  console.log(`   Платежей: ${await prisma.payment.count()}`);
  console.log('\n👥 Тестовые аккаунты:');
  console.log('   Админ: admin@vityazteam.ru / admin123');
  console.log('   Тренер: trainer@test.com / password123');
  console.log('   Родитель: parent@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при заполнении базы данных:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
