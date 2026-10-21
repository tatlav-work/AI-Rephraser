# 🖊️ AI Rephraser

> Интеллектуальный веб-сервис для перефразирования текстов с использованием современных моделей ИИ.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-ai--rephraser--api.onrender.com-6366f1?style=for-the-badge)](https://ai-rephraser-api.onrender.com)

![AI Rephraser Screenshot](screenshot.png)

---

## ✨ Основные функции

- **Мультиязычность**: русский и английский интерфейс
- **Многостилевая обработка**: стандартные стили + **custom** (свой промпт)
- **Выбор AI модели**: GPT-OSS 20B (быстрая) и GPT-OSS 120B (умная) через Groq API
- **3 уровня креативности**: от мягкого перефраза до глубокой переработки текста
- **Загрузка файлов**: поддержка TXT, PDF, DOC
- **Счётчик токенов**: видно сколько запросов и токенов осталось
- **История запросов**: быстрый доступ к предыдущим результатам
- **Копирование в один клик**: с визуальным подтверждением ✓
- **Адаптивный дизайн**: работает на мобильных устройствах

## 🛠️ Технологический стек

| Слой | Технологии |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Python, Flask |
| AI Engine | openai/gpt-oss-20b, openai/gpt-oss-120b via Groq API |
| Infrastructure | GitHub Pages (client) + Render (server) |

## 🚀 Как запустить

Сервис доступен по ссылке: **[https://ai-rephraser-api.onrender.com](https://ai-rephraser-api.onrender.com)**

> ⚠️ Так как сервер использует бесплатный тариф Render, при первом запросе после простоя может потребоваться около 50 секунд для пробуждения системы.
