import { Resend } from 'resend';
import prisma from '../config/database';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@vityazteam.ru';

export interface EmailNotification {
  to: string;
  subject: string;
  html: string;
}

export const notificationsService = {
  // Отправить email уведомление
  async sendEmail({ to, subject, html }: EmailNotification) {
    if (!resend) {
      console.warn('RESEND_API_KEY не настроен, email не отправлен:', subject);
      return null;
    }

    try {
      const { data, error } = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });

      if (error) {
        console.error('Ошибка отправки email:', error);
        return null;
      }

      console.log('Email успешно отправлен:', subject, 'to', to);
      return data;
    } catch (error) {
      console.error('Ошибка при отправке email:', error);
      return null;
    }
  },

  // Email: Успешная оплата
  async sendPaymentSuccessEmail(userId: string, paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true },
    });

    if (!payment || !payment.user.email) {
      return;
    }

    const childId = (payment.metadata as any)?.childId;
    let childName = '';

    if (childId) {
      const child = await prisma.child.findUnique({ where: { id: childId } });
      if (child) {
        childName = `${child.firstName} ${child.lastName}`;
      }
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .amount { font-size: 32px; font-weight: bold; color: #DC2626; }
            .details { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Оплата успешна!</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${payment.user.firstName}!</p>
              <p>Ваш платеж успешно обработан.</p>

              <div class="details">
                <div class="detail-row">
                  <span>Сумма:</span>
                  <span class="amount">${payment.amount} ₽</span>
                </div>
                <div class="detail-row">
                  <span>Тренировок добавлено:</span>
                  <strong>${payment.sessionsCount}</strong>
                </div>
                ${childName ? `
                <div class="detail-row">
                  <span>Для ребенка:</span>
                  <strong>${childName}</strong>
                </div>
                ` : ''}
                <div class="detail-row">
                  <span>Дата платежа:</span>
                  <span>${new Date(payment.createdAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}</span>
                </div>
              </div>

              <p>Баланс тренировок пополнен. Ждем вас на занятиях!</p>

              <p style="margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL}/parent"
                   style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Открыть личный кабинет
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Спортивный клуб «Витязь»</p>
              <p>Это автоматическое письмо, отвечать на него не нужно.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: payment.user.email,
      subject: '✅ Оплата успешна - Спортивный клуб Витязь',
      html,
    });
  },

  // Email: Низкий баланс тренировок
  async sendLowBalanceEmail(childId: string) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { parent: true },
    });

    if (!child || !child.parent.email) {
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .warning { background: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; }
            .balance { font-size: 48px; font-weight: bold; color: #F59E0B; text-align: center; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Баланс заканчивается</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${child.parent.firstName}!</p>

              <p>У вашего ребенка <strong>${child.firstName} ${child.lastName}</strong> заканчивается баланс тренировок.</p>

              <div class="balance">${child.balance}</div>
              <p style="text-align: center; color: #666;">
                ${child.balance === 1 ? 'тренировка' : child.balance < 5 ? 'тренировки' : 'тренировок'} осталось
              </p>

              <div class="warning">
                <strong>💡 Рекомендация:</strong> Пополните баланс заранее, чтобы не пропускать занятия.
              </div>

              <p style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/parent"
                   style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Пополнить баланс
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Спортивный клуб «Витязь»</p>
              <p>Это автоматическое письмо, отвечать на него не нужно.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: child.parent.email,
      subject: '⚠️ Баланс тренировок заканчивается - Спортивный клуб Витязь',
      html,
    });
  },

  // Email: Новые результаты ОФП
  async sendNewOFPResultsEmail(childId: string, ofpResultId: string) {
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { parent: true },
    });

    const ofpResult = await prisma.oFPResult.findUnique({
      where: { id: ofpResultId },
      include: { trainer: { include: { user: true } } },
    });

    if (!child || !child.parent.email || !ofpResult) {
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .info { background: white; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Новые результаты ОФП!</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${child.parent.firstName}!</p>

              <p>Тренер <strong>${ofpResult.trainer.user.firstName} ${ofpResult.trainer.user.lastName}</strong>
              внес результаты тестирования ОФП для вашего ребенка <strong>${child.firstName} ${child.lastName}</strong>.</p>

              <div class="info">
                <p><strong>Дата тестирования:</strong> ${new Date(ofpResult.testDate).toLocaleDateString('ru-RU')}</p>
                ${ofpResult.notes ? `<p><strong>Комментарий тренера:</strong> ${ofpResult.notes}</p>` : ''}
              </div>

              <p>Посмотрите детальные результаты, графики прогресса и сравнение с нормативами в личном кабинете.</p>

              <p style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/parent"
                   style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Посмотреть результаты
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Спортивный клуб «Витязь»</p>
              <p>Это автоматическое письмо, отвечать на него не нужно.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: child.parent.email,
      subject: '📊 Новые результаты ОФП - Спортивный клуб Витязь',
      html,
    });
  },

  // Email: Приветственное письмо после регистрации
  async sendWelcomeEmail(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.email) {
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9f9f9; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .features { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .feature { margin: 15px 0; padding-left: 30px; position: relative; }
            .feature::before { content: '✓'; position: absolute; left: 0; color: #DC2626; font-weight: bold; font-size: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>👋 Добро пожаловать в Витязь!</h1>
            </div>
            <div class="content">
              <p>Здравствуйте, ${user.firstName}!</p>

              <p>Спасибо за регистрацию в спортивном клубе «Витязь». Мы рады видеть вас в нашей команде!</p>

              <div class="features">
                <h3>Что вы можете делать в личном кабинете:</h3>
                <div class="feature">Добавлять профили детей</div>
                <div class="feature">Отслеживать посещения тренировок</div>
                <div class="feature">Просматривать результаты ОФП и графики прогресса</div>
                <div class="feature">Пополнять баланс тренировок онлайн</div>
                <div class="feature">Связываться с тренером</div>
              </div>

              <p style="margin-top: 30px; text-align: center;">
                <a href="${process.env.FRONTEND_URL}/parent"
                   style="background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Открыть личный кабинет
                </a>
              </p>
            </div>
            <div class="footer">
              <p>Спортивный клуб «Витязь»</p>
              <p>Если у вас есть вопросы, свяжитесь с нами.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: user.email,
      subject: '👋 Добро пожаловать в спортивный клуб Витязь!',
      html,
    });
  },
};
