// Роли пользователей
export enum Role {
  PARENT = 'PARENT',
  TRAINER = 'TRAINER',
  ADMIN = 'ADMIN',
}

// Пол
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

// Статус платежа
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

// Пользователь
export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  telegramChatId?: string;
  createdAt: string;
  updatedAt: string;
  trainer?: Trainer;
  children?: Child[];
}

// Ребенок
export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  photo?: string;
  gender: Gender;
  parentId: string;
  parent?: User;
  trainerId?: string;
  trainer?: Trainer;
  balance: number;
  weight?: number;
  emergencyContact?: string;
  medicalNotes?: string;
  createdAt: string;
  updatedAt: string;
  sessions?: Session[];
  ofpResults?: OFPResult[];
  metrics?: Metric[];
  achievements?: Achievement[];
}

// Тренер
export interface Trainer {
  id: string;
  userId: string;
  user: User;
  specialization?: string;
  experience?: number;
  bio?: string;
  certifications?: string;
  createdAt: string;
  updatedAt: string;
}

// Тренировка
export interface Session {
  id: string;
  childId: string;
  child?: Child;
  trainerId: string;
  trainer?: Trainer;
  date: string;
  duration: number;
  attended: boolean;
  notes?: string;
  markedAt?: string;
  createdAt: string;
}

// Результаты ОФП
export interface OFPResult {
  id: string;
  childId: string;
  child?: Child;
  trainerId: string;
  trainer?: Trainer;
  testDate: string;
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
  createdAt: string;
}

// Нормативы ОФП
export interface OFPStandard {
  id: string;
  ageFrom: number;
  ageTo: number;
  gender: Gender;
  run30m_min?: number;
  run30m_norm?: number;
  run30m_excel?: number;
  run60m_min?: number;
  run60m_norm?: number;
  run60m_excel?: number;
  run100m_min?: number;
  run100m_norm?: number;
  run100m_excel?: number;
  shuttleRun_min?: number;
  shuttleRun_norm?: number;
  shuttleRun_excel?: number;
  pullUps_min?: number;
  pullUps_norm?: number;
  pullUps_excel?: number;
  pushUps_min?: number;
  pushUps_norm?: number;
  pushUps_excel?: number;
  press30s_min?: number;
  press30s_norm?: number;
  press30s_excel?: number;
  longJump_min?: number;
  longJump_norm?: number;
  longJump_excel?: number;
  highJump_min?: number;
  highJump_norm?: number;
  highJump_excel?: number;
  flexibility_min?: number;
  flexibility_norm?: number;
  flexibility_excel?: number;
  ballThrow_min?: number;
  ballThrow_norm?: number;
  ballThrow_excel?: number;
}

// Метрики (рост, вес)
export interface Metric {
  id: string;
  childId: string;
  child?: Child;
  date: string;
  height?: number;
  weight?: number;
  chestCircumference?: number;
  waistCircumference?: number;
  notes?: string;
  createdAt: string;
}

// Платеж
export interface Payment {
  id: string;
  userId: string;
  user?: User;
  childId?: string;
  amount: number;
  currency: string;
  sessionsCount: number;
  status: PaymentStatus;
  paymentMethod?: string;
  externalId?: string;
  packageName?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// Достижение
export interface Achievement {
  id: string;
  childId: string;
  child?: Child;
  title: string;
  description: string;
  icon: string;
  category: string;
  earnedAt: string;
}

// API Response
export interface APIResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

// Формы
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface CreateChildForm {
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: Gender;
  weight?: number;
  emergencyContact?: string;
  medicalNotes?: string;
}

export interface CreateOFPResultForm {
  childId: string;
  testDate: string;
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
