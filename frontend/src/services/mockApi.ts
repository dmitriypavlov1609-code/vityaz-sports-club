import type { AxiosInstance } from 'axios';
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
  return { data: { success: true, data } };
}

function delay(ms = 200): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

export function installMockAdapter(api: AxiosInstance) {
  api.interceptors.request.use(async (config) => {
    const url = config.url || '';
    const method = (config.method || 'get').toLowerCase();
    const body = config.data ? (typeof config.data === 'string' ? JSON.parse(config.data) : config.data) : {};

    await delay(150 + Math.random() * 200);

    let response: any = null;

    // === AUTH ===
    if (url.includes('/auth/login') && method === 'post') {
      const email = body.email?.toLowerCase();
      if (email === 'parent@test.com') response = ok(DEMO_USERS.parent);
      else if (email === 'trainer@test.com') response = ok(DEMO_USERS.trainer);
      else if (email === 'admin@vityazteam.ru') response = ok(DEMO_USERS.admin);
      else throw mockError(401, 'Неверный email или пароль');
    }
    else if (url.includes('/auth/register') && method === 'post') {
      response = ok(DEMO_USERS.parent);
    }
    else if (url.includes('/auth/logout')) {
      response = ok(null);
    }
    else if (url.includes('/auth/me')) {
      const token = config.headers?.Authorization?.toString() || '';
      if (token.includes('trainer')) response = ok(DEMO_USERS.trainer.user);
      else if (token.includes('admin')) response = ok(DEMO_USERS.admin.user);
      else response = ok(DEMO_USERS.parent.user);
    }
    else if (url.includes('/auth/refresh')) {
      response = ok({ accessToken: 'demo-refreshed-token' });
    }

    // === CHILDREN ===
    else if (url.match(/\/children\/[^/]+\/stats/) && method === 'get') {
      response = ok({ totalSessions: 24, attended: 21, missed: 3, attendanceRate: 87.5 });
    }
    else if (url.match(/\/children\/[^/]+\/photo/) && method === 'post') {
      response = ok('https://placehold.co/200x200?text=Photo');
    }
    else if (url.match(/\/children\/([^/]+)$/) && method === 'get') {
      const id = url.split('/').pop();
      response = ok(DEMO_CHILDREN.find(c => c.id === id) || DEMO_CHILDREN[0]);
    }
    else if (url.endsWith('/children') && method === 'get') {
      response = ok(DEMO_CHILDREN.filter(c => c.parentId === 'u1'));
    }
    else if (url.endsWith('/children') && method === 'post') {
      response = ok({ ...body, id: 'c_new_' + Date.now(), balance: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    else if (url.match(/\/children\//) && method === 'put') {
      const id = url.split('/').pop();
      const child = DEMO_CHILDREN.find(c => c.id === id);
      response = ok({ ...child, ...body, updatedAt: new Date().toISOString() });
    }
    else if (url.match(/\/children\//) && method === 'delete') {
      response = ok(null);
    }

    // === SESSIONS ===
    else if (url.includes('/sessions/stats') && method === 'get') {
      response = ok(DEMO_TRAINER_STATS);
    }
    else if (url.includes('/sessions/today') && method === 'get') {
      const todayStr = new Date().toISOString().split('T')[0];
      response = ok(DEMO_SESSIONS.filter(s => s.date.startsWith(todayStr)));
    }
    else if (url.match(/\/sessions\/[^/]+\/attendance/) && method === 'put') {
      response = ok({ ...body, markedAt: new Date().toISOString() });
    }
    else if (url.match(/\/sessions\/([^/]+)$/) && method === 'get') {
      const id = url.split('/').pop();
      response = ok(DEMO_SESSIONS.find(s => s.id === id) || DEMO_SESSIONS[0]);
    }
    else if (url.match(/\/sessions\//) && method === 'delete') {
      response = ok(null);
    }
    else if (url.includes('/sessions') && method === 'get') {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const childId = params.get('childId');
      let sessions = [...DEMO_SESSIONS];
      if (childId) sessions = sessions.filter(s => s.childId === childId);
      response = ok(sessions);
    }
    else if (url.includes('/sessions') && method === 'post') {
      response = ok({ ...body, id: 's_new_' + Date.now(), attended: false, createdAt: new Date().toISOString() });
    }

    // === OFP ===
    else if (url.match(/\/ofp\/progress\/([^/]+)\/([^/]+)/)) {
      const parts = url.split('/');
      const field = parts[parts.length - 1];
      const childId = parts[parts.length - 2];
      const results = DEMO_OFP_RESULTS.filter(r => r.childId === childId);
      const points = results.map(r => ({
        date: r.testDate,
        value: (r as any)[field] ?? null,
      })).filter((p: any) => p.value !== null);
      response = ok(points);
    }
    else if (url.match(/\/ofp\/compare\/([^/]+)/)) {
      response = ok({ results: DEMO_OFP_RESULTS[0], standards: null, comparison: {} });
    }
    else if (url.includes('/ofp/standards')) {
      response = ok([]);
    }
    else if (url.match(/\/ofp\/child\/([^/]+)/)) {
      const childId = url.split('/').pop();
      response = ok(DEMO_OFP_RESULTS.filter(r => r.childId === childId));
    }
    else if (url.match(/\/ofp\/([^/]+)$/) && method === 'get') {
      const id = url.split('/').pop();
      response = ok(DEMO_OFP_RESULTS.find(r => r.id === id) || DEMO_OFP_RESULTS[0]);
    }
    else if (url.includes('/ofp') && method === 'post') {
      response = ok({ ...body, id: 'ofp_new_' + Date.now(), createdAt: new Date().toISOString() });
    }
    else if (url.match(/\/ofp\//) && method === 'put') {
      response = ok({ ...body, updatedAt: new Date().toISOString() });
    }
    else if (url.match(/\/ofp\//) && method === 'delete') {
      response = ok(null);
    }

    // === PAYMENTS ===
    else if (url.includes('/payments/tariffs')) {
      response = ok(DEMO_TARIFFS);
    }
    else if (url.includes('/payments/create') && method === 'post') {
      response = ok({ confirmationUrl: '#/payments/success', paymentId: 'pay_demo' });
    }
    else if (url.match(/\/payments\/([^/]+)$/) && method === 'get') {
      response = ok(DEMO_PAYMENTS[0]);
    }
    else if (url.includes('/payments') && method === 'get') {
      response = ok(DEMO_PAYMENTS);
    }

    // === ANALYTICS ===
    else if (url.includes('/analytics/dashboard')) {
      response = ok(DEMO_DASHBOARD_KPI);
    }
    else if (url.includes('/analytics/revenue')) {
      response = ok(DEMO_REVENUE_ANALYTICS);
    }
    else if (url.includes('/analytics/attendance')) {
      response = ok({ thisMonth: 87, lastMonth: 82, byDay: [] });
    }
    else if (url.includes('/analytics/trainers')) {
      response = ok([{ ...DEMO_USERS.trainer.user, sessionsCount: 156, studentsCount: 12, rating: 4.8 }]);
    }
    else if (url.includes('/analytics/ofp')) {
      response = ok({ averages: {}, improvements: {} });
    }
    else if (url.includes('/analytics/detailed')) {
      response = ok({ sessions: [], revenue: [], attendance: [] });
    }

    // === ADMIN ===
    else if (url.includes('/admin/assignments') && method === 'post') {
      response = ok({ ...body, createdAt: new Date().toISOString() });
    }
    else if (url.match(/\/admin\/assignments\//) && method === 'delete') {
      response = ok(null);
    }
    else if (url.includes('/admin/assignments') && method === 'get') {
      response = ok(DEMO_ASSIGNMENTS);
    }
    else if (url.match(/\/admin\/users\/[^/]+\/payments/)) {
      response = ok(DEMO_PAYMENTS);
    }
    else if (url.match(/\/admin\/users\/([^/]+)$/) && method === 'get') {
      const id = url.split('/').pop();
      const u = DEMO_ALL_USERS.find(u => u.id === id);
      response = ok(u || DEMO_ALL_USERS[0]);
    }
    else if (url.match(/\/admin\/users\//) && method === 'put') {
      response = ok({ ...body, updatedAt: new Date().toISOString() });
    }
    else if (url.match(/\/admin\/users\//) && method === 'delete') {
      response = ok(null);
    }
    else if (url.includes('/admin/users') && method === 'get') {
      response = ok(DEMO_ALL_USERS);
    }
    else if (url.includes('/admin/users') && method === 'post') {
      response = ok({ ...body, id: 'u_new_' + Date.now(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }

    // === HEALTH ===
    else if (url.includes('/health')) {
      response = ok({ status: 'ok', demo: true });
    }

    // === FALLBACK ===
    if (response) {
      // Cancel the real request by returning a resolved adapter response
      config.adapter = () => Promise.resolve({
        data: response.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      });
    }

    return config;
  });
}

function mockError(status: number, message: string) {
  const error: any = new Error(message);
  error.response = { status, data: { success: false, error: message, message } };
  return error;
}
