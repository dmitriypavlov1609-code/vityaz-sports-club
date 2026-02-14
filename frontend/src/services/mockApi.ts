import type { InternalAxiosRequestConfig } from 'axios';
import {
  DEMO_USERS,
  DEMO_CHILDREN,
  DEMO_SESSIONS,
  DEMO_OFP_RESULTS,
  DEMO_PAYMENTS,
  DEMO_DASHBOARD_KPI,
  DEMO_REVENUE_ANALYTICS,
  DEMO_TRAINER_STATS,
  DEMO_TARIFFS,
  DEMO_ALL_USERS,
  DEMO_ASSIGNMENTS,
} from './mockData';

function ok<T>(data: T) {
  return { success: true, data };
}

function route(config: InternalAxiosRequestConfig): any {
  const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  let body: any = {};
  try {
    body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};
  } catch { /* empty */ }

  const token = config.headers?.Authorization?.toString() || localStorage.getItem('accessToken') || '';

  // === AUTH ===
  if (url.includes('/auth/login') && method === 'post') {
    const email = body.email?.toLowerCase();
    if (email === 'parent@test.com') return ok(DEMO_USERS.parent);
    if (email === 'trainer@test.com') return ok(DEMO_USERS.trainer);
    if (email === 'admin@vityazteam.ru') return ok(DEMO_USERS.admin);
    return { success: false, error: 'Неверный email или пароль' };
  }
  if (url.includes('/auth/register') && method === 'post') {
    return ok(DEMO_USERS.parent);
  }
  if (url.includes('/auth/logout')) {
    return ok(null);
  }
  if (url.includes('/auth/me')) {
    if (token.includes('trainer')) return ok(DEMO_USERS.trainer.user);
    if (token.includes('admin')) return ok(DEMO_USERS.admin.user);
    return ok(DEMO_USERS.parent.user);
  }
  if (url.includes('/auth/refresh')) {
    return ok({ accessToken: token || 'demo-refreshed-token' });
  }

  // === CHILDREN ===
  if (url.match(/\/children\/[^/]+\/stats/)) {
    return ok({ totalSessions: 24, attended: 21, missed: 3, attendanceRate: 87.5 });
  }
  if (url.match(/\/children\/[^/]+\/photo/) && method === 'post') {
    return ok('https://placehold.co/200x200?text=Photo');
  }
  if (url.match(/\/children\/([^/]+)$/) && method === 'get') {
    const id = url.split('/').pop();
    return ok(DEMO_CHILDREN.find(c => c.id === id) || DEMO_CHILDREN[0]);
  }
  if ((url.endsWith('/children') || url.endsWith('/children/')) && method === 'get') {
    // Parent sees own children, trainer/admin sees all
    if (token.includes('parent')) return ok(DEMO_CHILDREN.filter(c => c.parentId === 'u1'));
    return ok(DEMO_CHILDREN);
  }
  if (url.endsWith('/children') && method === 'post') {
    return ok({ ...body, id: 'c_new_' + Date.now(), balance: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  if (url.match(/\/children\//) && method === 'put') {
    const id = url.split('/').pop();
    const child = DEMO_CHILDREN.find(c => c.id === id);
    return ok({ ...child, ...body, updatedAt: new Date().toISOString() });
  }
  if (url.match(/\/children\//) && method === 'delete') {
    return ok(null);
  }

  // === SESSIONS ===
  if (url.includes('/sessions/stats') && method === 'get') {
    return ok(DEMO_TRAINER_STATS);
  }
  if (url.includes('/sessions/today') && method === 'get') {
    const todayStr = new Date().toISOString().split('T')[0];
    return ok(DEMO_SESSIONS.filter(s => s.date.startsWith(todayStr)));
  }
  if (url.match(/\/sessions\/[^/]+\/attendance/) && method === 'put') {
    return ok({ ...body, markedAt: new Date().toISOString() });
  }
  if (url.match(/\/sessions\/([^/]+)$/) && method === 'get') {
    const id = url.split('/').pop();
    return ok(DEMO_SESSIONS.find(s => s.id === id) || DEMO_SESSIONS[0]);
  }
  if (url.match(/\/sessions\/[^?]/) && method === 'delete') {
    return ok(null);
  }
  if (url.includes('/sessions') && method === 'get') {
    const qIdx = url.indexOf('?');
    const params = new URLSearchParams(qIdx >= 0 ? url.substring(qIdx) : '');
    const childId = params.get('childId');
    let sessions = [...DEMO_SESSIONS];
    if (childId) sessions = sessions.filter(s => s.childId === childId);
    return ok(sessions);
  }
  if (url.includes('/sessions') && method === 'post') {
    return ok({ ...body, id: 's_new_' + Date.now(), attended: false, createdAt: new Date().toISOString() });
  }

  // === OFP ===
  if (url.match(/\/ofp\/progress\/([^/]+)\/([^/]+)/)) {
    const parts = url.split('/');
    const field = parts[parts.length - 1];
    const childId = parts[parts.length - 2];
    const results = DEMO_OFP_RESULTS.filter(r => r.childId === childId);
    const points = results.map(r => ({
      date: r.testDate,
      value: (r as any)[field] ?? null,
    })).filter((p: any) => p.value !== null);
    return ok(points);
  }
  if (url.match(/\/ofp\/compare\//)) {
    return ok({ results: DEMO_OFP_RESULTS[0], standards: null, comparison: {} });
  }
  if (url.includes('/ofp/standards')) {
    return ok([]);
  }
  if (url.match(/\/ofp\/child\/([^/]+)/)) {
    const parts = url.split('/');
    const childId = parts[parts.length - 1];
    return ok(DEMO_OFP_RESULTS.filter(r => r.childId === childId));
  }
  if (url.match(/\/ofp\/([^/]+)$/) && method === 'get') {
    const id = url.split('/').pop();
    return ok(DEMO_OFP_RESULTS.find(r => r.id === id) || DEMO_OFP_RESULTS[0]);
  }
  if (url.includes('/ofp') && method === 'post') {
    return ok({ ...body, id: 'ofp_new_' + Date.now(), createdAt: new Date().toISOString() });
  }
  if (url.match(/\/ofp\//) && method === 'put') {
    return ok({ ...body, updatedAt: new Date().toISOString() });
  }
  if (url.match(/\/ofp\//) && method === 'delete') {
    return ok(null);
  }

  // === PAYMENTS ===
  if (url.includes('/payments/tariffs')) {
    return ok(DEMO_TARIFFS);
  }
  if (url.includes('/payments/create') && method === 'post') {
    return ok({ confirmationUrl: '#/payments/success', paymentId: 'pay_demo' });
  }
  if (url.match(/\/payments\/([^/]+)$/) && method === 'get') {
    return ok(DEMO_PAYMENTS[0]);
  }
  if (url.includes('/payments') && method === 'get') {
    return ok(DEMO_PAYMENTS);
  }

  // === ANALYTICS ===
  if (url.includes('/analytics/dashboard')) {
    return ok(DEMO_DASHBOARD_KPI);
  }
  if (url.includes('/analytics/revenue')) {
    return ok(DEMO_REVENUE_ANALYTICS);
  }
  if (url.includes('/analytics/attendance')) {
    return ok({ thisMonth: 87, lastMonth: 82, byDay: [] });
  }
  if (url.includes('/analytics/trainers')) {
    return ok([{ ...DEMO_USERS.trainer.user, sessionsCount: 156, studentsCount: 12, rating: 4.8 }]);
  }
  if (url.includes('/analytics/ofp')) {
    return ok({ averages: {}, improvements: {} });
  }
  if (url.includes('/analytics/detailed')) {
    return ok({ sessions: [], revenue: [], attendance: [] });
  }

  // === ADMIN ===
  if (url.includes('/admin/assignments') && method === 'post') {
    return ok({ ...body, createdAt: new Date().toISOString() });
  }
  if (url.match(/\/admin\/assignments\//) && method === 'delete') {
    return ok(null);
  }
  if (url.includes('/admin/assignments') && method === 'get') {
    return ok(DEMO_ASSIGNMENTS);
  }
  if (url.match(/\/admin\/users\/[^/]+\/payments/)) {
    return ok(DEMO_PAYMENTS);
  }
  if (url.match(/\/admin\/users\/([^/]+)$/) && method === 'get') {
    const id = url.split('/').pop();
    const found = DEMO_ALL_USERS.find(u => u.id === id);
    return ok(found || DEMO_ALL_USERS[0]);
  }
  if (url.match(/\/admin\/users\//) && method === 'put') {
    return ok({ ...body, updatedAt: new Date().toISOString() });
  }
  if (url.match(/\/admin\/users\//) && method === 'delete') {
    return ok(null);
  }
  if (url.includes('/admin/users') && method === 'get') {
    return ok(DEMO_ALL_USERS);
  }
  if (url.includes('/admin/users') && method === 'post') {
    return ok({ ...body, id: 'u_new_' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }

  // === HEALTH ===
  if (url.includes('/health')) {
    return ok({ status: 'ok', demo: true });
  }

  // === FALLBACK ===
  console.warn(`[DEMO] Unhandled: ${method.toUpperCase()} ${url}`);
  return ok(null);
}

// Кастомный axios adapter — полностью заменяет HTTP-запросы
export function createMockAdapter() {
  return async (config: InternalAxiosRequestConfig) => {
    // Имитация задержки сети
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200));

    const data = route(config);

    if (data && !data.success && data.error) {
      const error: any = new Error(data.error);
      error.response = {
        data,
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      };
      throw error;
    }

    return {
      data,
      status: 200,
      statusText: 'OK',
      headers: {} as any,
      config,
    };
  };
}
