# L1+L2: Введение в высоконагруженные системы

> Материалы для подготовки к лекции и семинару C1

---

## Reading List

Прочитать **до лекции**.

### Блок 1: Требования и NFR

| # | Что читать | Время | Зачем |
|---|-----------|-------|-------|
| 1 | [SLI, SLO, SLA — Google SRE Book, Ch.4](https://sre.google/sre-book/service-level-objectives/) | 15 мин | Как формулировать требования к надёжности измеримо, а не "система должна быть быстрой" |
| 2 | [NFR Framework](NFR-Framework.md) | 5 мин | Авторский фреймворк курса: как определить, какие NFR влияют на архитектуру (понадобится на C1) |

### Блок 2: Масштабирование

| # | Что читать                                                                         | Время | Зачем |
|---|------------------------------------------------------------------------------------|-------|-------|
| 3 | [MonolithFirst — Martin Fowler](https://martinfowler.com/bliki/MonolithFirst.html) | 7 мин | Почему начинать с микросервисов — почти всегда ошибка |
| 4 | [The Twelve-Factor App](https://12factor.net/ru/)                                  | 10 мин | 12 принципов, которые делают приложение готовым к масштабированию (особенно VI: Processes — stateless) |

### Блок 3: Распределённые системы

| # | Что читать | Время | Зачем |
|---|-----------|-------|-------|
| 5 | [8 Fallacies of Distributed Computing — Wikipedia](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing) | 5 мин | 8 ошибочных предположений о сети, которые ломают распределённые системы |
| 6 | [Circuit Breaker — Martin Fowler](https://martinfowler.com/bliki/CircuitBreaker.html) | 7 мин | Паттерн предотвращения каскадных отказов: как не положить всю систему из-за одного упавшего сервиса |

---

## Формула Peak RPS

Главная формула курса для расчёта пиковой нагрузки:

```
Peak RPS = (DAU x Requests_per_user x Peak_coefficient) / (Peak_hours x 3600)
```

Пример: банк, день зарплаты — `(50K x 5 x 3) / (4 x 3600) = 52 RPS`

---

## Подготовка к семинару C1

**Дата:** 20.02.2026 | **Время подготовки:** 20 минут (Reading List + шаблон)

### Что будет на C1

Вы получите неполное описание реальной highload-системы. Задачи:

1. **Сформулировать NFR измеримо** — в формате `SLI + оператор + SLO + условия`
2. **Оценить архитектурную значимость** — применить [NFR Framework](NFR-Framework.md) к каждому NFR
3. **Рассчитать Peak RPS** — по формуле выше
4. **Найти недостающие требования** — что забыли? какие вопросы задать заказчику?

### Формат

- **Think** (индивидуально): 10-15 мин
- **Pair** (обсуждение с соседом): 10 мин
- **Share** (презентация): 2-3 пары по 3 мин

### Шаблон

Используйте [Requirements Template](Requirements-Template.md) для оформления результата.

### Чек-лист

- [ ] Прочитал Reading List (~40 мин)
- [ ] Понял формулу Peak RPS
- [ ] Готов применять NFR Framework самостоятельно
- [ ] Принёс калькулятор или ноутбук

---

## Дополнительные материалы

Необязательно, но полезно:

- [Capacity Planning for Web Apps — Kir Shatrov](https://kirshatrov.com/posts/capacity-planning-for-web-apps/) — практический подход к capacity planning
- [Capacity Planning — ByteByteGo](https://blog.bytebytego.com/p/capacity-planning) — визуальный разбор с диаграммами
- [CAP Theorem — Wikipedia](https://en.wikipedia.org/wiki/CAP_theorem) — теорема, определяющая trade-offs распределённых систем (подробно на L8)
