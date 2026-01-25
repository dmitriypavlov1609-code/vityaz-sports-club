# Руководство по деплою

## Требования

- GitHub аккаунт
- Vercel аккаунт (для frontend)
- Railway аккаунт (для backend и PostgreSQL)
- ЮKassa аккаунт и API ключи
- Resend аккаунт для email

## 1. Подготовка репозитория

```bash
# Инициализация Git (если еще не сделано)
cd /path/to/vityaz-sports-club
git init
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и запушьте
git remote add origin https://github.com/YOUR_USERNAME/vityaz-sports-club.git
git push -u origin main
```

## 2. Деплой Backend на Railway

### 2.1 Создание проекта

1. Зайдите на https://railway.app
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo"
4. Выберите ваш репозиторий `vityaz-sports-club`
5. Выберите папку `backend` как Root Directory

### 2.2 Создание PostgreSQL базы данных

1. В том же проекте нажмите "+ New"
2. Выберите "Database" → "Add PostgreSQL"
3. Railway автоматически создаст переменную `DATABASE_URL`

### 2.3 Настройка переменных окружения

В настройках Backend service добавьте:

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT
JWT_SECRET=your-super-secret-jwt-key-CHANGE-THIS-IN-PRODUCTION
JWT_REFRESH_SECRET=your-super-secret-refresh-key-CHANGE-THIS-IN-PRODUCTION
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS
FRONTEND_URL=https://your-app.vercel.app

# ЮKassa
UKASSA_SHOP_ID=your_shop_id
UKASSA_SECRET_KEY=your_secret_key
UKASSA_RETURN_URL=https://your-app.vercel.app/payments/success
UKASSA_WEBHOOK_URL=https://your-backend.up.railway.app/api/payments/webhook

# Resend Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com
```

### 2.4 Деплой

1. Railway автоматически задеплоит backend
2. Получите URL вашего backend: https://your-backend.up.railway.app

## 3. Деплой Frontend на Vercel

### 3.1 Импорт проекта

1. Зайдите на https://vercel.com
2. Нажмите "Add New..." → "Project"
3. Импортируйте ваш GitHub репозиторий
4. Framework Preset: Vite
5. Root Directory: `frontend`

### 3.2 Настройка переменных окружения

В настройках проекта добавьте:

```env
VITE_API_URL=https://your-backend.up.railway.app/api
```

### 3.3 Деплой

1. Нажмите "Deploy"
2. Vercel автоматически задеплоит и даст вам URL: https://your-app.vercel.app

## 4. Настройка базы данных

После деплоя backend, выполните миграции через Railway CLI или через веб-интерфейс:

```bash
# Через Railway CLI
railway login
railway link
railway run npx prisma migrate deploy

# Опционально: Seed данные для демо
railway run npx prisma db seed
```

## 5. Настройка ЮKassa Webhook

1. Зайдите в личный кабинет ЮKassa
2. Перейдите в настройки интеграции
3. Добавьте Webhook URL: `https://your-backend.up.railway.app/api/payments/webhook`
4. Выберите события: `payment.succeeded`, `payment.canceled`

## 6. Настройка домена (опционально)

### Frontend (Vercel):
1. В настройках проекта → Domains
2. Добавьте ваш домен (например, vityazteam.ru)
3. Настройте DNS записи согласно инструкциям Vercel

### Backend (Railway):
1. В настройках service → Settings → Domains
2. Добавьте кастомный домен (например, api.vityazteam.ru)
3. Настройте DNS записи

### Обновление переменных окружения:
После настройки доменов обновите:
- В Vercel: `VITE_API_URL=https://api.vityazteam.ru/api`
- В Railway:
  - `FRONTEND_URL=https://vityazteam.ru`
  - `UKASSA_RETURN_URL=https://vityazteam.ru/payments/success`
  - `UKASSA_WEBHOOK_URL=https://api.vityazteam.ru/api/payments/webhook`
  - `EMAIL_FROM=noreply@vityazteam.ru`

## 7. Мониторинг и логи

### Railway:
- Логи доступны в веблинтерфейсе проекта
- Мониторинг CPU/Memory/Network

### Vercel:
- Логи доступны в разделе "Deployments"
- Аналитика трафика в разделе "Analytics"

## 8. CI/CD

Автоматический деплой настроен по умолчанию:

### Railway:
- При пуше в `main` ветку автоматически деплоится backend
- Можно настроить preview deployments для pull requests

### Vercel:
- При пуше в `main` автоматически деплоится production
- Для каждого PR создается preview deployment

## 9. Rollback

### Vercel:
1. Перейдите в "Deployments"
2. Найдите предыдущий успешный деплой
3. Нажмите "..." → "Promote to Production"

### Railway:
1. Перейдите в "Deployments"
2. Выберите предыдущий успешный деплой
3. Нажмите "Redeploy"

## 10. Проверка работоспособности

После деплоя проверьте:

- ✅ Frontend открывается по URL
- ✅ Можно залогиниться с демо аккаунтами
- ✅ API отвечает (проверьте через /api/health если реализован)
- ✅ База данных подключена
- ✅ Email уведомления работают (зарегистрируйте нового пользователя)
- ✅ ЮKassa Webhook принимается (сделайте тестовый платеж)

## Дополнительные настройки

### Увеличение лимитов памяти (Railway):
В `railway.json` можно указать:
```json
{
  "deploy": {
    "startCommand": "NODE_OPTIONS='--max-old-space-size=2048' npm start"
  }
}
```

### Настройка кэширования (Vercel):
В `vercel.json` добавьте headers для статических файлов:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Troubleshooting

### Backend не запускается
- Проверьте логи в Railway
- Убедитесь что все переменные окружения заданы
- Проверьте что DATABASE_URL правильный

### Frontend не может подключиться к API
- Проверьте CORS настройки в backend
- Убедитесь что VITE_API_URL правильный
- Проверьте что backend доступен по URL

### Миграции не применяются
- Выполните вручную через Railway CLI: `railway run npx prisma migrate deploy`

### ЮKassa webhook не работает
- Проверьте URL webhook в личном кабинете ЮKassa
- Убедитесь что endpoint `/api/payments/webhook` доступен
- Проверьте логи backend на наличие ошибок

---

Готово! Ваше приложение задеплоено и готово к использованию! 🚀
