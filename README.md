# 🌸 Floronym

> Генератор поэтических названий для букетов на базе LLM

Floronym — это TypeScript-система для автоматического наполнения словаря красивых названий букетов. Использует несколько LLM-моделей через Groq API и локальный Ollama, контролирует лимиты токенов, фильтрует галлюцинации и гарантирует уникальность каждого названия.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)

---

## ✨ Возможности

- **Многомодельная генерация** — ротация между Qwen3-32B, GPT-OSS-120B, Kimi-K2, LLaMA и локальными моделями
- **Адаптивный rate limiting** — sliding window по токенам и запросам (минута / день)
- **Тематические очереди** — равномерное заполнение категорий с приоритетами
- **Умная фильтрация** — кириллица, длина, стоп-символы, иероглифы, латиница
- **Дедупликация** — работа целиком в памяти, O(1) проверка через Set
- **Надёжность** — graceful shutdown, периодический autosave, восстановление после сбоя
- **Расширяемость** — новая модель = одна строка в конфиге

---

## 🗂 Структура проекта

```
floronym/
├── src/
│   ├── core/              # TokenBudget, RateLimiter, Logger
│   ├── providers/         # GroqProvider, BaseProvider, ProviderManager
│   ├── generation/        # ThemeQueue, PromptBuilder, Generator
│   ├── validation/        # Validator (кириллица, длина, качество)
│   ├── store/             # NameStore (Set в памяти + JSON на диске)
│   └── index.ts
├── config/
│   ├── models.ts          # Лимиты и параметры моделей
│   └── themes.ts          # Темы и целевые количества
└── data/
    └── names.json         # Хранилище названий
```

---

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
# Добавить GROQ_API_KEY в .env

# Запуск генератора
npm run generate

# Статистика по базе
npm run stats
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

## 💾 Хранилище

Все названия хранятся в `data/names.json`. При старте файл загружается в память, дедупликация работает через `Set` — O(1). Autosave каждые 100 новых имён + при завершении процесса.

```json
[
  { "name": "Алый рассвет",  "theme": "природа", "model": "qwen/qwen3-32b",      "createdAt": "2026-03-01T18:00:00Z" },
  { "name": "Тихая гавань",  "theme": "эмоции",  "model": "openai/gpt-oss-120b", "createdAt": "2026-03-01T18:01:00Z" }
]
```

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

**Добавить нового провайдера (OpenAI, Anthropic):**
```typescript
// Унаследовать BaseProvider, переопределить sendRequest() и parseRateLimitHeaders()
```

---

## 🛠 Технологии

- **Runtime:** Node.js 20+ / TypeScript 5.x
- **Groq API:** `groq-sdk`
- **Локальные модели:** Ollama
- **Логирование:** pino
- **CLI:** commander

---

## 👤 Автор

**Alexander Kuzikov**
GitHub: [@AlexanderKuzikov](https://github.com/AlexanderKuzikov)

🔗 **Репозиторий:** [github.com/AlexanderKuzikov/Floronym](https://github.com/AlexanderKuzikov/Floronym)

---

## 📄 Лицензия

Распространяется под лицензией [Apache License 2.0](LICENSE).
