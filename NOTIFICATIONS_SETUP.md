# Настройка системы уведомлений

## Email уведомления через Resend

### 1. Получение API ключа Resend

1. Зарегистрируйтесь на [Resend](https://resend.com/)
2. Создайте API ключ в разделе API Keys
3. Добавьте ключ в `.env`:

```env
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="noreply@vityazteam.ru"
```

### 2. Настройка домена (опционально для продакшена)

Для отправки с собственного домена:

1. Добавьте домен в Resend Dashboard
2. Настройте DNS записи (SPF, DKIM, DMARC)
3. Верифицируйте домен
4. Используйте email вида `noreply@yourdomain.com`

Для разработки можно использовать тестовый email Resend.

## Типы email уведомлений

### 1. Приветственное письмо
**Триггер**: Регистрация нового родителя
**Кому**: Новый пользователь
**Содержание**:
- Приветствие
- Список возможностей личного кабинета
- Кнопка "Открыть личный кабинет"

**Реализация**:
```typescript
// В auth.service.ts после создания пользователя
notificationsService.sendWelcomeEmail(user.id)
```

### 2. Успешная оплата
**Триггер**: Webhook от ЮKassa `payment.succeeded`
**Кому**: Родитель, совершивший оплату
**Содержание**:
- Сумма платежа
- Количество добавленных тренировок
- Имя ребенка
- Дата платежа
- Кнопка "Открыть личный кабинет"

**Реализация**:
```typescript
// В payments.service.ts в handleWebhook
notificationsService.sendPaymentSuccessEmail(payment.userId, payment.id)
```

### 3. Низкий баланс тренировок
**Триггер**: Баланс ребенка становится ≤ 3 после отметки посещения
**Кому**: Родитель ребенка
**Содержание**:
- Текущий баланс
- Имя ребенка
- Рекомендация пополнить заранее
- Кнопка "Пополнить баланс"

**Реализация**:
```typescript
// В sessions.service.ts после списания баланса
if (updatedChild.balance <= 3 && updatedChild.balance > 0) {
  notificationsService.sendLowBalanceEmail(updatedChild.id)
}
```

### 4. Новые результаты ОФП
**Триггер**: Тренер вносит результаты тестирования ОФП
**Кому**: Родитель ребенка
**Содержание**:
- Дата тестирования
- Имя тренера
- Комментарий тренера (если есть)
- Кнопка "Посмотреть результаты"

**Реализация**:
```typescript
// В ofp.service.ts после создания результата
notificationsService.sendNewOFPResultsEmail(data.childId, result.id)
```

## Структура email шаблонов

Все email используют единый стиль с брендингом клуба Витязь:

- **Цвета**: Красный (#DC2626), Серый (#333), Белый
- **Шапка**: Красный фон с белым текстом
- **Контент**: Серый фон (#f9f9f9)
- **Кнопки**: Красные с белым текстом
- **Футер**: Серый текст, мелкий шрифт

### Пример структуры

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <style>/* Стили */</style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Заголовок</h1>
      </div>
      <div class="content">
        <!-- Основное содержание -->
      </div>
      <div class="footer">
        <p>Спортивный клуб «Витязь»</p>
      </div>
    </div>
  </body>
</html>
```

## Тестирование email

### Локальное тестирование

1. **Без реального отправления**:
   Если `RESEND_API_KEY` не установлен, emails не отправляются, но логируются в консоль.

2. **С реальным отправлением**:
   Установите `RESEND_API_KEY` и используйте свой email для тестирования.

### Инструменты для превью

- [Litmus](https://litmus.com/) - превью в различных почтовых клиентах
- [Email on Acid](https://www.emailonacid.com/) - тестирование рендеринга
- [Resend Preview](https://resend.com/docs/send-with-react) - встроенный превью

## Мониторинг

### Логирование

Все email операции логируются:

```
✅ Email успешно отправлен: [subject] to [email]
❌ Ошибка отправки email: [error]
```

### Метрики Resend

В дашборде Resend доступны:
- Количество отправленных emails
- Процент доставки
- Bounces (недоставленные)
- Spam reports
- Opens и Clicks (требует настройки)

## Ограничения и квоты

### Resend Free Plan
- 100 emails/день
- 3,000 emails/месяц
- До 100 получателей на email

### Resend Pro Plan ($20/мес)
- 50,000 emails/месяц
- Дополнительно $1 за 1,000 emails
- Приоритетная поддержка

## Best Practices

### 1. Асинхронная отправка
Всегда отправляйте emails асинхронно, чтобы не блокировать ответ API:

```typescript
notificationsService.sendEmail(...).catch((error) => {
  console.error('Ошибка отправки email:', error);
});
```

### 2. Fallback стратегия
Если email не отправлен - система продолжает работать. Критичные уведомления можно дублировать через:
- Push уведомления (будущая фича)
- Telegram Bot (будущая фича)
- SMS (опционально)

### 3. Unsubscribe
Для продакшена добавьте ссылку отписки в футер:

```html
<p>
  <a href="${process.env.FRONTEND_URL}/unsubscribe?token=${token}">
    Отписаться от уведомлений
  </a>
</p>
```

### 4. Персонализация
Всегда обращайтесь к пользователю по имени:

```html
<p>Здравствуйте, ${user.firstName}!</p>
```

### 5. CTA (Call To Action)
Каждое письмо должно содержать четкий призыв к действию:

```html
<a href="${process.env.FRONTEND_URL}/parent"
   style="background: #DC2626; color: white; padding: 12px 24px;">
  Открыть личный кабинет
</a>
```

## Будущие улучшения

- [ ] Browser Push уведомления (Web Push API)
- [ ] Telegram Bot интеграция
- [ ] Email templates через React Email
- [ ] Настройки уведомлений в профиле (какие emails получать)
- [ ] Scheduled emails (напоминания о тренировках за N часов)
- [ ] Batch sending для массовых рассылок
- [ ] Email analytics (открытия, клики)

## Troubleshooting

### Email не отправляется

1. **Проверьте API ключ**:
   ```bash
   echo $RESEND_API_KEY
   ```

2. **Проверьте логи backend**:
   ```bash
   tail -f /path/to/backend/logs
   ```

3. **Проверьте квоту Resend**:
   Зайдите в Resend Dashboard → Usage

### Email попадает в спам

1. Настройте SPF, DKIM, DMARC для домена
2. Используйте реальный домен (не @gmail.com)
3. Избегайте спам-слов в теме и тексте
4. Добавьте физический адрес компании в футер

### Медленная отправка

Email отправляются асинхронно и не должны замедлять API. Если проблемы:

1. Проверьте сетевое соединение с Resend API
2. Используйте queue систему (Bull, BullMQ) для отложенной отправки
3. Кешируйте templates если используете React Email

## Продакшен чеклист

- [ ] Настроен RESEND_API_KEY
- [ ] Домен верифицирован в Resend
- [ ] DNS записи настроены (SPF, DKIM)
- [ ] EMAIL_FROM использует корпоративный домен
- [ ] Все email templates протестированы
- [ ] Добавлены ссылки unsubscribe
- [ ] Настроен мониторинг и алерты
- [ ] Проверена квота и выбран подходящий план
