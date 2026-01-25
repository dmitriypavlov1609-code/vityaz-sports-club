import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Gender } from '@prisma/client';
import { notificationsService } from './notifications.service';

interface CreateOFPResultData {
  childId: string;
  trainerId: string;
  testDate: Date;
  run30m?: number;
  run60m?: number;
  run100m?: number;
  shuttleRun?: number;
  pullUps?: number;
  pushUps?: number;
  press30s?: number;
  longJump?: number;
  highJump?: number;
  flexibility?: number;
  ballThrow?: number;
  notes?: string;
}

export class OFPService {
  // Получить результаты ОФП для ребенка
  static async getChildOFPResults(childId: string, userId: string, role: string) {
    // Проверка прав доступа
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { parent: true },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    if (role === 'PARENT' && child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || child.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }
    }

    return await prisma.oFPResult.findMany({
      where: { childId },
      include: {
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { testDate: 'desc' },
    });
  }

  // Получить один результат ОФП
  static async getOFPResultById(resultId: string, userId: string, role: string) {
    const result = await prisma.oFPResult.findUnique({
      where: { id: resultId },
      include: {
        child: {
          include: {
            parent: true,
          },
        },
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      throw new AppError('Результат не найден', 404, 'RESULT_NOT_FOUND');
    }

    // Проверка прав доступа
    if (role === 'PARENT' && result.child.parentId !== userId) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || result.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }
    }

    return result;
  }

  // Создать результат ОФП (только тренер)
  static async createOFPResult(userId: string, data: CreateOFPResultData) {
    // Получить профиль тренера
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer) {
      throw new AppError('Профиль тренера не найден', 404, 'TRAINER_NOT_FOUND');
    }

    // Проверить, что ребенок существует
    const child = await prisma.child.findUnique({
      where: { id: data.childId },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Создать результат
    const result = await prisma.oFPResult.create({
      data: {
        childId: data.childId,
        trainerId: trainer.id,
        testDate: data.testDate,
        run30m: data.run30m,
        run60m: data.run60m,
        run100m: data.run100m,
        shuttleRun: data.shuttleRun,
        pullUps: data.pullUps,
        pushUps: data.pushUps,
        press30s: data.press30s,
        longJump: data.longJump,
        highJump: data.highJump,
        flexibility: data.flexibility,
        ballThrow: data.ballThrow,
        notes: data.notes,
      },
      include: {
        child: true,
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Отправить email уведомление родителю о новых результатах
    notificationsService.sendNewOFPResultsEmail(data.childId, result.id).catch((error) => {
      console.error('Ошибка отправки email о результатах ОФП:', error);
    });

    return result;
  }

  // Обновить результат ОФП (только тренер)
  static async updateOFPResult(
    resultId: string,
    userId: string,
    data: Partial<CreateOFPResultData>
  ) {
    const result = await prisma.oFPResult.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      throw new AppError('Результат не найден', 404, 'RESULT_NOT_FOUND');
    }

    // Проверка, что это результат этого тренера
    const trainer = await prisma.trainer.findUnique({
      where: { userId },
    });

    if (!trainer || result.trainerId !== trainer.id) {
      throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
    }

    const updateData: any = {};
    if (data.testDate) updateData.testDate = data.testDate;
    if (data.run30m !== undefined) updateData.run30m = data.run30m;
    if (data.run60m !== undefined) updateData.run60m = data.run60m;
    if (data.run100m !== undefined) updateData.run100m = data.run100m;
    if (data.shuttleRun !== undefined) updateData.shuttleRun = data.shuttleRun;
    if (data.pullUps !== undefined) updateData.pullUps = data.pullUps;
    if (data.pushUps !== undefined) updateData.pushUps = data.pushUps;
    if (data.press30s !== undefined) updateData.press30s = data.press30s;
    if (data.longJump !== undefined) updateData.longJump = data.longJump;
    if (data.highJump !== undefined) updateData.highJump = data.highJump;
    if (data.flexibility !== undefined) updateData.flexibility = data.flexibility;
    if (data.ballThrow !== undefined) updateData.ballThrow = data.ballThrow;
    if (data.notes !== undefined) updateData.notes = data.notes;

    return await prisma.oFPResult.update({
      where: { id: resultId },
      data: updateData,
      include: {
        child: true,
        trainer: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  // Удалить результат ОФП (только тренер или админ)
  static async deleteOFPResult(resultId: string, userId: string, role: string) {
    const result = await prisma.oFPResult.findUnique({
      where: { id: resultId },
    });

    if (!result) {
      throw new AppError('Результат не найден', 404, 'RESULT_NOT_FOUND');
    }

    if (role === 'TRAINER') {
      const trainer = await prisma.trainer.findUnique({
        where: { userId },
      });

      if (!trainer || result.trainerId !== trainer.id) {
        throw new AppError('Недостаточно прав', 403, 'FORBIDDEN');
      }
    }

    await prisma.oFPResult.delete({
      where: { id: resultId },
    });
  }

  // Получить нормативы ОФП
  static async getOFPStandards() {
    return await prisma.oFPStandard.findMany({
      orderBy: [{ gender: 'asc' }, { ageFrom: 'asc' }],
    });
  }

  // Сравнить результат ребенка с нормативами
  static async compareWithStandards(childId: string, resultId?: string) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
    });

    if (!child) {
      throw new AppError('Ребенок не найден', 404, 'CHILD_NOT_FOUND');
    }

    // Вычислить возраст
    const age = Math.floor(
      (Date.now() - new Date(child.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    // Найти подходящий стандарт
    const standard = await prisma.oFPStandard.findFirst({
      where: {
        gender: child.gender,
        ageFrom: { lte: age },
        ageTo: { gte: age },
      },
    });

    if (!standard) {
      throw new AppError(
        'Нормативы для данного возраста не найдены',
        404,
        'STANDARDS_NOT_FOUND'
      );
    }

    // Получить результат (последний или конкретный)
    let result;
    if (resultId) {
      result = await prisma.oFPResult.findUnique({
        where: { id: resultId },
      });
    } else {
      result = await prisma.oFPResult.findFirst({
        where: { childId },
        orderBy: { testDate: 'desc' },
      });
    }

    if (!result) {
      return {
        child: {
          id: child.id,
          firstName: child.firstName,
          lastName: child.lastName,
          age,
          gender: child.gender,
        },
        standard,
        result: null,
        comparison: null,
      };
    }

    // Сравнение каждого показателя
    const comparison: any = {};

    const compareField = (
      value: number | null | undefined,
      min: number | null | undefined,
      norm: number | null | undefined,
      excel: number | null | undefined,
      isLowerBetter: boolean = false
    ) => {
      if (value === null || value === undefined) return null;
      if (min === null || norm === null || excel === null) return null;

      if (isLowerBetter) {
        // Для бега: меньше = лучше
        if (value <= excel!) return 'excellent';
        if (value <= norm!) return 'norm';
        if (value <= min!) return 'below';
        return 'poor';
      } else {
        // Для силовых: больше = лучше
        if (value >= excel!) return 'excellent';
        if (value >= norm!) return 'norm';
        if (value >= min!) return 'below';
        return 'poor';
      }
    };

    // Беговые нормативы (меньше = лучше)
    comparison.run30m = compareField(
      result.run30m,
      standard.run30m_min,
      standard.run30m_norm,
      standard.run30m_excel,
      true
    );
    comparison.run60m = compareField(
      result.run60m,
      standard.run60m_min,
      standard.run60m_norm,
      standard.run60m_excel,
      true
    );
    comparison.run100m = compareField(
      result.run100m,
      standard.run100m_min,
      standard.run100m_norm,
      standard.run100m_excel,
      true
    );
    comparison.shuttleRun = compareField(
      result.shuttleRun,
      standard.shuttleRun_min,
      standard.shuttleRun_norm,
      standard.shuttleRun_excel,
      true
    );

    // Силовые нормативы (больше = лучше)
    comparison.pullUps = compareField(
      result.pullUps,
      standard.pullUps_min,
      standard.pullUps_norm,
      standard.pullUps_excel
    );
    comparison.pushUps = compareField(
      result.pushUps,
      standard.pushUps_min,
      standard.pushUps_norm,
      standard.pushUps_excel
    );
    comparison.press30s = compareField(
      result.press30s,
      standard.press30s_min,
      standard.press30s_norm,
      standard.press30s_excel
    );
    comparison.longJump = compareField(
      result.longJump,
      standard.longJump_min,
      standard.longJump_norm,
      standard.longJump_excel
    );
    comparison.highJump = compareField(
      result.highJump,
      standard.highJump_min,
      standard.highJump_norm,
      standard.highJump_excel
    );
    comparison.flexibility = compareField(
      result.flexibility,
      standard.flexibility_min,
      standard.flexibility_norm,
      standard.flexibility_excel
    );
    comparison.ballThrow = compareField(
      result.ballThrow,
      standard.ballThrow_min,
      standard.ballThrow_norm,
      standard.ballThrow_excel
    );

    return {
      child: {
        id: child.id,
        firstName: child.firstName,
        lastName: child.lastName,
        age,
        gender: child.gender,
      },
      standard,
      result,
      comparison,
    };
  }

  // Получить динамику прогресса (для графиков)
  static async getProgressData(childId: string, field: string) {
    const results = await prisma.oFPResult.findMany({
      where: { childId },
      orderBy: { testDate: 'asc' },
      select: {
        id: true,
        testDate: true,
        [field]: true,
      },
    });

    return results
      .filter((r: any) => r[field] !== null && r[field] !== undefined)
      .map((r: any) => ({
        date: r.testDate,
        value: r[field],
      }));
  }
}
