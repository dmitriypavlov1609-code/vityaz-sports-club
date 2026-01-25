import prisma from '../config/database';

export const analyticsService = {
  // Dashboard KPI метрики
  async getDashboardKPI() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Общее количество пользователей
    const [totalParents, totalTrainers, totalChildren] = await Promise.all([
      prisma.user.count({ where: { role: 'PARENT' } }),
      prisma.user.count({ where: { role: 'TRAINER' } }),
      prisma.child.count(),
    ]);

    // Активные дети (с балансом > 0)
    const activeChildren = await prisma.child.count({
      where: { balance: { gt: 0 } },
    });

    // Выручка за текущий месяц
    const revenueThisMonth = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    });

    // Выручка за прошлый месяц
    const revenueLastMonth = await prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { amount: true },
    });

    // Посещаемость за текущий месяц
    const attendanceThisMonth = await prisma.session.count({
      where: {
        attended: true,
        date: { gte: startOfMonth },
      },
    });

    // Посещаемость за прошлый месяц
    const attendanceLastMonth = await prisma.session.count({
      where: {
        attended: true,
        date: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
    });

    // Новые регистрации за месяц
    const newParentsThisMonth = await prisma.user.count({
      where: {
        role: 'PARENT',
        createdAt: { gte: startOfMonth },
      },
    });

    // Рассчитать изменения в процентах
    const revenueChange =
      revenueLastMonth._sum.amount && revenueLastMonth._sum.amount > 0
        ? ((((revenueThisMonth._sum.amount || 0) - revenueLastMonth._sum.amount) /
            revenueLastMonth._sum.amount) *
            100).toFixed(1)
        : '0';

    const attendanceChange =
      attendanceLastMonth > 0
        ? (((attendanceThisMonth - attendanceLastMonth) / attendanceLastMonth) * 100).toFixed(1)
        : '0';

    return {
      users: {
        totalParents,
        totalTrainers,
        totalChildren,
        activeChildren,
        newParentsThisMonth,
      },
      revenue: {
        thisMonth: revenueThisMonth._sum.amount || 0,
        lastMonth: revenueLastMonth._sum.amount || 0,
        change: parseFloat(revenueChange),
        paymentsCount: revenueThisMonth._count || 0,
      },
      attendance: {
        thisMonth: attendanceThisMonth,
        lastMonth: attendanceLastMonth,
        change: parseFloat(attendanceChange),
      },
    };
  },

  // Финансовая аналитика (по месяцам за последние 6 месяцев)
  async getRevenueAnalytics() {
    const months: Array<{ month: string; revenue: number; payments: number }> = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

      const result = await prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      });

      months.push({
        month: startDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
        revenue: result._sum.amount || 0,
        payments: result._count || 0,
      });
    }

    // Средний чек
    const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0);
    const totalPayments = months.reduce((sum, m) => sum + m.payments, 0);
    const averageCheck = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    return {
      months,
      summary: {
        totalRevenue,
        totalPayments,
        averageCheck: Math.round(averageCheck),
      },
    };
  },

  // Статистика посещаемости
  async getAttendanceStats() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Посещаемость за последние 30 дней
    const sessions = await prisma.session.findMany({
      where: {
        date: { gte: last30Days },
      },
      select: {
        attended: true,
        date: true,
      },
    });

    // Группировка по дням
    const dailyStats: Record<string, { attended: number; total: number }> = {};

    sessions.forEach((session) => {
      const dateKey = session.date.toISOString().split('T')[0];
      if (!dailyStats[dateKey]) {
        dailyStats[dateKey] = { attended: 0, total: 0 };
      }
      dailyStats[dateKey].total++;
      if (session.attended) {
        dailyStats[dateKey].attended++;
      }
    });

    // Преобразовать в массив
    const daily = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      attended: stats.attended,
      total: stats.total,
      rate: stats.total > 0 ? Math.round((stats.attended / stats.total) * 100) : 0,
    }));

    // Общая статистика
    const totalSessions = sessions.length;
    const attendedSessions = sessions.filter((s) => s.attended).length;
    const attendanceRate = totalSessions > 0 ? Math.round((attendedSessions / totalSessions) * 100) : 0;

    return {
      daily,
      summary: {
        totalSessions,
        attendedSessions,
        missedSessions: totalSessions - attendedSessions,
        attendanceRate,
      },
    };
  },

  // Рейтинг тренеров
  async getTrainersRating() {
    const trainers = await prisma.trainer.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        children: {
          select: {
            id: true,
          },
        },
        sessions: {
          where: {
            attended: true,
          },
          select: {
            id: true,
          },
        },
        ofpResults: {
          select: {
            id: true,
          },
        },
      },
    });

    const rating = trainers.map((trainer) => ({
      trainerId: trainer.id,
      trainerName: `${trainer.user.firstName} ${trainer.user.lastName}`,
      specialization: trainer.specialization,
      experience: trainer.experience,
      studentsCount: trainer.children.length,
      attendedSessions: trainer.sessions.length,
      ofpTestsCount: trainer.ofpResults.length,
    }));

    // Сортировать по количеству учеников
    rating.sort((a, b) => b.studentsCount - a.studentsCount);

    return rating;
  },

  // Статистика ОФП по всему клубу
  async getOFPStatistics() {
    // Все результаты ОФП за последний год
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const results = await prisma.oFPResult.findMany({
      where: {
        testDate: { gte: oneYearAgo },
      },
      include: {
        child: {
          select: {
            gender: true,
            dateOfBirth: true,
          },
        },
      },
    });

    if (results.length === 0) {
      return {
        totalTests: 0,
        byGender: { male: 0, female: 0 },
        averages: {},
      };
    }

    // Подсчет средних значений по всем показателям
    const fields = ['run30m', 'run60m', 'run100m', 'shuttleRun', 'pullUps', 'pushUps', 'press30s', 'longJump', 'highJump', 'flexibility', 'ballThrow'];

    const averages: Record<string, number> = {};

    fields.forEach((field) => {
      const values = results
        .map((r) => (r as any)[field])
        .filter((v) => v !== null && v !== undefined);

      if (values.length > 0) {
        const sum = values.reduce((acc, val) => acc + val, 0);
        averages[field] = Math.round((sum / values.length) * 100) / 100;
      }
    });

    // Разделение по полу
    const maleResults = results.filter((r) => r.child.gender === 'MALE');
    const femaleResults = results.filter((r) => r.child.gender === 'FEMALE');

    return {
      totalTests: results.length,
      byGender: {
        male: maleResults.length,
        female: femaleResults.length,
      },
      averages,
      testsPerMonth: Math.round((results.length / 12) * 10) / 10,
    };
  },

  // Детальная аналитика по периоду
  async getDetailedAnalytics(startDate: Date, endDate: Date) {
    const [revenue, sessions, ofpTests, newUsers] = await Promise.all([
      // Выручка
      prisma.payment.aggregate({
        where: {
          status: 'COMPLETED',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Тренировки
      prisma.session.aggregate({
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),

      // Тесты ОФП
      prisma.oFPResult.count({
        where: {
          testDate: { gte: startDate, lte: endDate },
        },
      }),

      // Новые пользователи
      prisma.user.count({
        where: {
          role: 'PARENT',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      revenue: {
        total: revenue._sum.amount || 0,
        payments: revenue._count || 0,
      },
      sessions: sessions._count || 0,
      ofpTests,
      newUsers,
    };
  },
};
