# 🚀 Быстрый старт

Минимальная инструкция для запуска проекта локально.

## 1. Предварительные требования

- Node.js 20+ ([скачать](https://nodejs.org/))
- Docker Desktop ([скачать](https://www.docker.com/products/docker-desktop/))

## 2. Запуск базы данных

```bash
# Запуск PostgreSQL в Docker
docker-compose up -d

# Проверка статуса
docker-compose ps
```

## 3. Настройка Backend

```bash
# Перейти в папку backend
cd backend

# Установить зависимости
npm install

# Выполнить миграции базы данных
npx prisma migrate dev

# Заполнить базу тестовыми данными
npm run prisma:seed

# Запустить сервер (http://localhost:5000)
npm run dev
```

## 4. Настройка Frontend

В **новом терминале**:

```bash
# Перейти в папку frontend
cd frontend

# Установить зависимости
npm install

# Запустить приложение (http://localhost:5173)
npm run dev
```

## 5. Готово! 🎉

Откройте http://localhost:5173 в браузере.

### Тестовые аккаунты:

- **Родитель**: parent@test.com / password123
- **Тренер**: trainer@test.com / password123
- **Админ**: admin@vityazteam.ru / admin123

## Полезные команды

```bash
# Prisma Studio (GUI для БД)
cd backend && npx prisma studio

# Остановить PostgreSQL
docker-compose down

# Пересоздать БД с нуля
cd backend
npx prisma migrate reset
npm run prisma:seed
```

## Проблемы?

1. **Порт 5432 занят?** Измените порт в `docker-compose.yml` и `backend/.env`
2. **Ошибка подключения к БД?** Проверьте `docker-compose ps` - контейнер должен быть "healthy"
3. **Ошибки npm?** Попробуйте `rm -rf node_modules package-lock.json && npm install`

Подробная документация в [README.md](./README.md)
