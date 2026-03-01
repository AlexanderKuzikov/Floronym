# 🌸 Floronym

> Генератор поэтических названий для букетов на базе LLM

Floronym — это TypeScript-система для автоматического наполнения словаря красивых названий букетов. Использует несколько LLM-моделей через Groq API и локальный Ollama, контролирует лимиты токенов, фильтрует галлюцинации и гарантирует уникальность каждого названия.

---

## ✨ Возможности

- **Многомодельная генерация** — ротация между Qwen3-32B, GPT-OSS-120B, Kimi-K2, LLaMA и локальными моделями
- **Адаптивный rate limiting** — sliding window по токенам и запросам (минута / день)
- **Тематические очереди** — равномерное заполнение категорий с приоритетами
- **Умная фильтрация** — кириллица, длина, стоп-символы, иероглифы, латиница
- **Дедупликация** — точное совпадение + нормализованное сравнение
- **Мониторинг** — rejection rate, токены на имя, статистика сессий
- **Расширяемость** — новая модель = одна строка в конфиге

---

## 🗂 Структура проекта

```
floronym/
├── src/
│   ├── core/              # TokenBudget, RateLimiter, Logger
│   ├── providers/         # GroqProvider, OllamaProvider, ProviderManager
│   ├── generation/        # ThemeQueue, PromptBuilder, Generator
│   ├── validation/        # LanguageFilter, QualityFilter, Validator
│   ├── storage/           # Database, NameRepository, EmbeddingStore
│   ├── monitoring/        # StatsTracker, Dashboard
│   └── index.ts
├── config/
│   ├── models.ts          # Лимиты и параметры моделей
│   ├── themes.ts          # Темы и целевые количества
│   └── filters.ts         # Пороги фильтрации
├── data/
│   ├── floronym.db        # SQLite база данных
│   ├── logs/              # JSON-логи сессий
│   └── exports/           # CSV / JSON экспорт
└── scripts/
    ├── export.ts          # Экспорт базы
    ├── stats.ts           # Аналитика
    └── seed-themes.ts     # Первоначальное наполнение
```

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
# Добавить GROQ_API_KEY в .env

# Инициализация базы данных
npm run db:init

# Запуск генератора
npm run generate

# Экспорт результатов
npm run export
```

---

## ⚙️ Конфигурация

### Модели (`config/models.ts`)
Каждая модель описывается объектом с лимитами и параметрами генерации. Приоритет определяет порядок использования — сначала качественные большие модели, потом быстрые.

### Темы (`config/themes.ts`)
Каждая тема имеет `target` — сколько названий нужно набрать. Генератор всегда выбирает тему с наибольшим дефицитом `(target - generated)`.

Примеры тем:
- Природа и времена года
- Эмоции и чувства
- Цвет и свет
- Мифология и поэзия
- Женские имена и архетипы
- Музыка, искусство, танец
- Города и путешествия

---

## 🗃 Схема базы данных

```sql
-- Названия букетов
CREATE TABLE names (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  normalized  TEXT NOT NULL,
  theme       TEXT NOT NULL,
  model       TEXT NOT NULL,
  quality     REAL DEFAULT NULL,
  used_at     DATETIME DEFAULT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Статистика сессий генерации
CREATE TABLE sessions (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  model       TEXT NOT NULL,
  theme       TEXT NOT NULL,
  generated   INTEGER,
  accepted    INTEGER,
  rejected    INTEGER,
  tokens_used INTEGER,
  started_at  DATETIME,
  finished_at DATETIME
);
```

---

## 📊 Мониторинг

В процессе генерации отслеживаются три ключевые метрики:

| Метрика | Порог тревоги | Действие |
|---|---|---|
| `filter_rejected` | > 30% | Сменить тему или промпт |
| `db_duplicates` | > 50% | База насыщена, повысить приоритет другой темы |
| `tokens_per_name` | > 15 | Укоротить промпт |

---

## 🔌 Расширение

**Добавить новую модель:**
```typescript
// config/models.ts
{ id: "новая/модель", provider: "groq", priority: 3, limits: { ... } }
```

**Добавить новый фильтр:**
```typescript
// Реализовать IFilter, зарегистрировать в Validator.ts
```

**Добавить нового провайдера:**
```typescript
// Унаследовать BaseProvider, переопределить sendRequest() и parseRateLimitHeaders()
```

---

## 🛠 Технологии

- **Runtime:** Node.js + TypeScript
- **База данных:** SQLite (better-sqlite3)
- **Groq API:** официальный SDK `groq-sdk`
- **Локальные модели:** Ollama
- **Логирование:** pino
- **CLI:** commander

---

## 📄 Лицензия

Apache License 2.0
