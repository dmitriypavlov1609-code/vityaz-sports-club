# Настройка платежной системы ЮKassa

## Получение ключей ЮKassa

1. Зарегистрируйтесь на [ЮKassa](https://yookassa.ru/)
2. Создайте магазин
3. Получите:
   - `shopId` (ID магазина)
   - `secretKey` (секретный ключ)

## Настройка переменных окружения

Добавьте в `.env` файл:

```env
UKASSA_SHOP_ID="ваш_shop_id"
UKASSA_SECRET_KEY="ваш_secret_key"
UKASSA_RETURN_URL="http://localhost:5173/payments/success"
UKASSA_WEBHOOK_URL="http://localhost:5000/api/payments/webhook"
```

Для продакшена:
```env
UKASSA_RETURN_URL="https://vityazteam.ru/payments/success"
UKASSA_WEBHOOK_URL="https://api.vityazteam.ru/api/payments/webhook"
```

## Настройка Webhook в ЮKassa

1. Войдите в личный кабинет ЮKassa
2. Перейдите в раздел "Настройки" → "Уведомления"
3. Добавьте URL для webhook: `https://api.vityazteam.ru/api/payments/webhook`
4. Включите следующие уведомления:
   - `payment.succeeded` - успешная оплата
   - `payment.canceled` - отмена оплаты

## Тарифные планы

Система поддерживает следующие тарифы:

| ID | Название | Тренировок | Цена | Цена за тренировку |
|----|----------|------------|------|-------------------|
| `trial` | Пробное занятие | 1 | 500 ₽ | 500 ₽ |
| `single` | Разовое посещение | 1 | 800 ₽ | 800 ₽ |
| `package_8` | Абонемент 8 занятий | 8 | 5600 ₽ | 700 ₽ |
| `package_12` | Абонемент 12 занятий | 12 | 7800 ₽ | 650 ₽ |
| `unlimited` | Безлимит месяц | 30 | 12000 ₽ | 400 ₽ |

## Флоу оплаты

### 1. Создание платежа (Frontend)
```typescript
const payment = await paymentsService.createPayment(tariffId, childId);
// Перенаправление на страницу оплаты ЮKassa
window.location.href = payment.confirmationUrl;
```

### 2. Оплата на стороне ЮKassa
Пользователь оплачивает на странице ЮKassa:
- Банковские карты (Visa, MasterCard, МИР)
- СБП (Система Быстрых Платежей)
- Электронные кошельки
- Apple Pay, Google Pay

### 3. Возврат на сайт
После оплаты пользователь возвращается на `/payments/success?paymentId=xxx`

### 4. Webhook от ЮKassa
ЮKassa отправляет webhook на `/api/payments/webhook` с событием:
```json
{
  "type": "payment.succeeded",
  "object": {
    "id": "external_payment_id",
    "status": "succeeded",
    ...
  }
}
```

### 5. Обработка webhook (Backend)
```typescript
// 1. Найти платеж по externalId
// 2. Обновить статус на COMPLETED
// 3. Пополнить баланс ребенка на количество тренировок
await prisma.$transaction([
  prisma.payment.update({ where: { id }, data: { status: 'COMPLETED' }}),
  prisma.child.update({ where: { id: childId }, data: { balance: { increment: sessionsCount }}}),
]);
```

## API Endpoints

### Получить тарифы
```
GET /api/payments/tariffs
Authorization: Bearer <token>
```

### Создать платеж
```
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "tariffId": "package_8",
  "childId": "child_uuid"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "paymentId": "payment_uuid",
    "confirmationUrl": "https://yoomoney.ru/checkout/payments/...",
    "amount": 5600,
    "sessionsCount": 8
  }
}
```

### История платежей
```
GET /api/payments
Authorization: Bearer <token>
```

### Получить платеж по ID
```
GET /api/payments/:id
Authorization: Bearer <token>
```

### Webhook (без авторизации)
```
POST /api/payments/webhook
Content-Type: application/json

{
  "type": "payment.succeeded",
  "object": { ... }
}
```

## Безопасность

1. **Webhook защита**: ЮKassa подписывает webhook своим ключом. В продакшене рекомендуется проверять подпись.
2. **HTTPS обязателен** для webhook в продакшене
3. **Idempotency key**: используется UUID для предотвращения дублирующих платежей
4. **Транзакции**: пополнение баланса происходит атомарно вместе с обновлением статуса

## Тестирование

### Тестовые карты ЮKassa

Успешная оплата:
- Номер: `5555 5555 5555 4477`
- Срок: любой будущий
- CVC: любой 3-значный

Отклонение:
- Номер: `5555 5555 5555 5599`

### Локальное тестирование webhook

Используйте [ngrok](https://ngrok.com/) для создания публичного URL:

```bash
ngrok http 5000
```

Полученный URL (например, `https://abc123.ngrok.io`) используйте в настройках ЮKassa:
```
https://abc123.ngrok.io/api/payments/webhook
```

## Troubleshooting

### Webhook не приходит
1. Проверьте URL в настройках ЮKassa
2. Убедитесь, что сервер доступен публично (ngrok для локальной разработки)
3. Проверьте логи backend сервера

### Баланс не пополняется
1. Проверьте, что webhook получен (логи backend)
2. Убедитесь, что `childId` передан в metadata платежа
3. Проверьте таблицу payments в БД - статус должен быть COMPLETED

### Ошибка при создании платежа
1. Проверьте переменные `UKASSA_SHOP_ID` и `UKASSA_SECRET_KEY`
2. Убедитесь, что ребенок принадлежит авторизованному родителю
3. Проверьте, что tariffId существует

## Продакшен чеклист

- [ ] Получить боевые ключи ЮKassa (не тестовые)
- [ ] Настроить HTTPS на backend
- [ ] Обновить `UKASSA_WEBHOOK_URL` на продакшен URL
- [ ] Настроить webhook в личном кабинете ЮKassa
- [ ] Добавить проверку подписи webhook (опционально)
- [ ] Настроить мониторинг платежей
- [ ] Добавить отправку email подтверждений оплаты
- [ ] Протестировать на реальных картах

## Email уведомления (TODO)

После успешной оплаты нужно отправить email родителю:
- Чек об оплате
- Количество добавленных тренировок
- Текущий баланс

Будет реализовано в Task #10 (Система уведомлений).
