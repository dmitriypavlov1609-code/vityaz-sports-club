import { Role, Gender, PaymentStatus } from '@/types';

// === USERS ===
export const DEMO_USERS = {
  parent: {
    user: {
      id: 'u1',
      email: 'parent@test.com',
      role: Role.PARENT,
      firstName: 'Елена',
      lastName: 'Смирнова',
      phone: '+79161234567',
      emailNotifications: true,
      pushNotifications: true,
      createdAt: '2024-09-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    accessToken: 'demo-parent-token',
    refreshToken: 'demo-parent-refresh',
  },
  trainer: {
    user: {
      id: 'u2',
      email: 'trainer@test.com',
      role: Role.TRAINER,
      firstName: 'Алексей',
      lastName: 'Петров',
      phone: '+79031112233',
      emailNotifications: true,
      pushNotifications: true,
      createdAt: '2024-06-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      trainer: {
        id: 't1',
        userId: 'u2',
        specialization: 'Бокс, ОФП',
        experience: 8,
        bio: 'Мастер спорта по боксу. Тренерский стаж 8 лет.',
        certifications: 'МС по боксу, тренер высшей категории',
        createdAt: '2024-06-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
      },
    },
    accessToken: 'demo-trainer-token',
    refreshToken: 'demo-trainer-refresh',
  },
  admin: {
    user: {
      id: 'u3',
      email: 'admin@vityazteam.ru',
      role: Role.ADMIN,
      firstName: 'Дмитрий',
      lastName: 'Волков',
      phone: '+79501234567',
      emailNotifications: true,
      pushNotifications: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    },
    accessToken: 'demo-admin-token',
    refreshToken: 'demo-admin-refresh',
  },
};

// === CHILDREN ===
export const DEMO_CHILDREN = [
  {
    id: 'c1',
    firstName: 'Максим',
    lastName: 'Смирнов',
    middleName: 'Андреевич',
    dateOfBirth: '2015-03-15T00:00:00Z',
    gender: Gender.MALE,
    parentId: 'u1',
    trainerId: 't1',
    balance: 4,
    weight: 35,
    emergencyContact: '+79161234567',
    medicalNotes: '',
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'c2',
    firstName: 'Анна',
    lastName: 'Смирнова',
    dateOfBirth: '2017-07-22T00:00:00Z',
    gender: Gender.FEMALE,
    parentId: 'u1',
    trainerId: 't1',
    balance: 6,
    weight: 28,
    emergencyContact: '+79161234567',
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'c3',
    firstName: 'Артём',
    lastName: 'Козлов',
    middleName: 'Игоревич',
    dateOfBirth: '2014-11-05T00:00:00Z',
    gender: Gender.MALE,
    parentId: 'u4',
    trainerId: 't1',
    balance: 2,
    weight: 42,
    createdAt: '2024-08-15T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'c4',
    firstName: 'София',
    lastName: 'Иванова',
    dateOfBirth: '2016-01-30T00:00:00Z',
    gender: Gender.FEMALE,
    parentId: 'u5',
    trainerId: 't1',
    balance: 8,
    weight: 30,
    createdAt: '2024-09-10T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// === SESSIONS ===
const today = new Date();
const fmt = (d: Date) => d.toISOString();
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return d; };
const daysLater = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

export const DEMO_SESSIONS = [
  { id: 's1', childId: 'c1', child: DEMO_CHILDREN[0], trainerId: 't1', date: fmt(daysAgo(1)), duration: 90, attended: true, notes: 'Хорошая работа', markedAt: fmt(daysAgo(1)), createdAt: fmt(daysAgo(7)) },
  { id: 's2', childId: 'c2', child: DEMO_CHILDREN[1], trainerId: 't1', date: fmt(daysAgo(1)), duration: 60, attended: true, markedAt: fmt(daysAgo(1)), createdAt: fmt(daysAgo(7)) },
  { id: 's3', childId: 'c3', child: DEMO_CHILDREN[2], trainerId: 't1', date: fmt(daysAgo(1)), duration: 90, attended: false, notes: 'Пропуск по болезни', markedAt: fmt(daysAgo(1)), createdAt: fmt(daysAgo(7)) },
  { id: 's4', childId: 'c1', child: DEMO_CHILDREN[0], trainerId: 't1', date: fmt(daysAgo(3)), duration: 90, attended: true, markedAt: fmt(daysAgo(3)), createdAt: fmt(daysAgo(10)) },
  { id: 's5', childId: 'c4', child: DEMO_CHILDREN[3], trainerId: 't1', date: fmt(daysAgo(3)), duration: 60, attended: true, markedAt: fmt(daysAgo(3)), createdAt: fmt(daysAgo(10)) },
  { id: 's6', childId: 'c1', child: DEMO_CHILDREN[0], trainerId: 't1', date: fmt(today), duration: 90, attended: false, createdAt: fmt(daysAgo(3)) },
  { id: 's7', childId: 'c2', child: DEMO_CHILDREN[1], trainerId: 't1', date: fmt(today), duration: 60, attended: false, createdAt: fmt(daysAgo(3)) },
  { id: 's8', childId: 'c3', child: DEMO_CHILDREN[2], trainerId: 't1', date: fmt(today), duration: 90, attended: false, createdAt: fmt(daysAgo(3)) },
  { id: 's9', childId: 'c1', child: DEMO_CHILDREN[0], trainerId: 't1', date: fmt(daysLater(2)), duration: 90, attended: false, createdAt: fmt(daysAgo(1)) },
  { id: 's10', childId: 'c4', child: DEMO_CHILDREN[3], trainerId: 't1', date: fmt(daysLater(2)), duration: 60, attended: false, createdAt: fmt(daysAgo(1)) },
];

// === OFP RESULTS ===
export const DEMO_OFP_RESULTS = [
  {
    id: 'ofp1', childId: 'c1', trainerId: 't1', testDate: '2025-01-10T00:00:00Z',
    run30m: 5.8, run60m: 10.2, shuttleRun: 11.5, pullUps: 5, pushUps: 20, press30s: 22, longJump: 160, flexibility: 8,
    notes: 'Хорошие результаты', createdAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'ofp2', childId: 'c1', trainerId: 't1', testDate: '2024-10-15T00:00:00Z',
    run30m: 6.1, run60m: 10.8, shuttleRun: 12.0, pullUps: 3, pushUps: 15, press30s: 18, longJump: 145, flexibility: 6,
    notes: 'Начальное тестирование', createdAt: '2024-10-15T00:00:00Z',
  },
  {
    id: 'ofp3', childId: 'c2', trainerId: 't1', testDate: '2025-01-10T00:00:00Z',
    run30m: 6.5, pushUps: 12, press30s: 15, longJump: 120, flexibility: 12,
    createdAt: '2025-01-10T00:00:00Z',
  },
];

// === PAYMENTS ===
export const DEMO_PAYMENTS = [
  { id: 'p1', userId: 'u1', childId: 'c1', amount: 4800, currency: 'RUB', sessionsCount: 8, status: PaymentStatus.COMPLETED, packageName: 'Стандарт (8 занятий)', createdAt: '2025-01-05T10:00:00Z', updatedAt: '2025-01-05T10:01:00Z' },
  { id: 'p2', userId: 'u1', childId: 'c2', amount: 3200, currency: 'RUB', sessionsCount: 8, status: PaymentStatus.COMPLETED, packageName: 'Стандарт (8 занятий)', createdAt: '2024-12-01T12:00:00Z', updatedAt: '2024-12-01T12:01:00Z' },
  { id: 'p3', userId: 'u1', childId: 'c1', amount: 4800, currency: 'RUB', sessionsCount: 8, status: PaymentStatus.COMPLETED, packageName: 'Стандарт (8 занятий)', createdAt: '2024-11-05T09:00:00Z', updatedAt: '2024-11-05T09:01:00Z' },
];

// === ANALYTICS ===
export const DEMO_DASHBOARD_KPI = {
  users: { totalParents: 24, totalTrainers: 4, totalChildren: 38, activeChildren: 32, newParentsThisMonth: 3 },
  revenue: { thisMonth: 184600, lastMonth: 168200, change: 9.7, paymentsCount: 31 },
  attendance: { thisMonth: 87, lastMonth: 82, change: 6.1 },
};

export const DEMO_REVENUE_ANALYTICS = {
  total: 1250000,
  monthly: [
    { month: '2024-07', revenue: 95000, payments: 18 },
    { month: '2024-08', revenue: 112000, payments: 21 },
    { month: '2024-09', revenue: 138000, payments: 25 },
    { month: '2024-10', revenue: 145000, payments: 26 },
    { month: '2024-11', revenue: 156000, payments: 28 },
    { month: '2024-12', revenue: 168200, payments: 29 },
    { month: '2025-01', revenue: 184600, payments: 31 },
  ],
};

// === TRAINER STATS ===
export const DEMO_TRAINER_STATS = {
  totalSessions: 156,
  totalChildren: 12,
  todaySessions: 3,
  upcomingSessions: 8,
};

// === TARIFFS ===
export const DEMO_TARIFFS = [
  { id: 'tar1', name: 'Пробное', sessionsCount: 1, price: 800, description: '1 пробное занятие' },
  { id: 'tar2', name: 'Стандарт', sessionsCount: 8, price: 4800, description: '8 занятий в месяц' },
  { id: 'tar3', name: 'Безлимит', sessionsCount: 12, price: 6400, description: '12 занятий в месяц' },
];

// === ALL USERS (for admin) ===
export const DEMO_ALL_USERS = [
  DEMO_USERS.parent.user,
  { ...DEMO_USERS.trainer.user, trainer: DEMO_USERS.trainer.user.trainer },
  DEMO_USERS.admin.user,
  { id: 'u4', email: 'kozlov@test.com', role: Role.PARENT, firstName: 'Игорь', lastName: 'Козлов', phone: '+79221234567', emailNotifications: true, pushNotifications: false, createdAt: '2024-08-15T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', children: [DEMO_CHILDREN[2]] },
  { id: 'u5', email: 'ivanova@test.com', role: Role.PARENT, firstName: 'Мария', lastName: 'Иванова', phone: '+79335556677', emailNotifications: true, pushNotifications: true, createdAt: '2024-09-10T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', children: [DEMO_CHILDREN[3]] },
];

// === ASSIGNMENTS ===
export const DEMO_ASSIGNMENTS = DEMO_CHILDREN.map(c => ({
  childId: c.id,
  child: c,
  trainerId: 't1',
  trainer: DEMO_USERS.trainer.user.trainer,
}));
