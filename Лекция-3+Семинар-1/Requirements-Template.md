# Requirements Template

> Шаблон для документирования требований к highload системе
>
> Использовать для: Семинар С1, Домашнее задание

---

# Requirements Document: [Название системы]

**Версия:** 1.0
**Дата:** YYYY-MM-DD
**Составил:** [Имя]

---

## 1. Business Goals

**Домен:** [например "Финтех / Платёжный процессинг"]
**Бизнес-модель:** B2C / B2B / B2B2C
**Целевая аудитория:** [кто пользователи, сколько их]
**Регионы:** [например "РФ, СНГ" или "Global"]

**Главная цель:**

- [Описание бизнес-цели]

**Ключевые метрики:**

- [Метрика 1, например "1M активных пользователей через 1 год"]
- [Метрика 2, например "$10M revenue через 6 месяцев"]

---

## 2. Функциональные требования (ФТ)

### FR-001: [Название функции]

**Priority:** High / Medium / Low

**Описание:**

- Как [роль], я хочу [действие], чтобы [цель/выгода]

**Acceptance Criteria:**

- [ ] Критерий 1
- [ ] Критерий 2

---

## 3. Нефункциональные требования (НФТ)

### NFR-P01: [Performance - Latency]

**SLI (что измеряем):**

- [например "p95 latency GET /api/products"]

**SLO (целевое значение):**

- [например "< 200ms при 10K concurrent users"]

**Framework оценка:**

- **Impact:** High/Medium/Low - [почему]
- **Cost of Change:** High/Medium/Low - [почему]
- **Business Risk:** High/Medium/Low - [почему]

**Архитектурно-значимый:** Да/Нет (2+ из 3 = High?)

---

### NFR-A01: [Availability]

**SLI:** % successful requests (HTTP 200-299)
**SLO:** ≥ 99.X% (макс Y часов downtime/год)

**Framework оценка:** [как выше]

---

### NFR-S01: [Scalability Strategy]

**Выбор:** Scale-up / Scale-out / Hybrid

**Обоснование:**

- [почему выбрали эту стратегию]
- [нагрузка, availability, бюджет, команда]

---

## 4. Load Calculations

**Read/Write ratio:** [например "90/10" или "60/40"]

**Current State:**

- DAU: [число]
- Average RPS: [расчёт]

### Peak Scenario: [Название, например "День зарплаты"]

**Дано:**

- Peak DAU: [число]
- Requests per user: [число]
- Peak coefficient: [число]x
- Peak hours: [часы]

**Расчёт Peak RPS:**

```
Peak RPS = (DAU × Req/user × Peak_coef) / (Peak_hours × 3600)
         = ([DAU] × [req] × [coef]) / ([hours] × 3600)
         = [результат] RPS
```

**Growth Forecast:**

- Year 1: [ожидаемый DAU и RPS]
- Year 3: [ожидаемый DAU и RPS]

### Latency Budget

**Endpoint:** [например "POST /api/transfer"]
**SLO:** [например "p95 < 500ms"]

| Компонент              | Latency (ms)         | Комментарий       |
|------------------------|----------------------|-------------------|
| [компонент 1]          | [число]              | [источник оценки] |
| [компонент 2]          | [число]              |                   |
| [компонент 3]          | [число]              |                   |
| **TOTAL**              | **[сумма]**          |                   |
| **Buffer (30%)**       | **[число]**          |                   |
| **BUDGETED**           | **[сумма]**          |                   |
| **Remaining from SLO** | **[SLO - BUDGETED]** | ✅ / ❌             |

**Bottleneck:** [какой компонент доминирует и что с этим делать]

---

## 6. Data & Storage

- Текущий объём: [например "500 GB"]
- Прирост: [например "~2 GB/день"]
- Консистентность: Strong / Eventual — [почему]

---

## 7. Architecturally Significant NFR

| NFR ID  | Impact | Cost | Risk   | Critical? | Влияние на архитектуру        |
|---------|--------|------|--------|-----------|-------------------------------|
| NFR-P01 | High   | High | Medium | ✅ Yes     | CDN, caching, DB optimization |
| NFR-A01 | High   | High | High   | ✅ Yes     | Multi-AZ, replication, LB     |
| NFR-S01 | High   | High | Medium | ✅ Yes     | Horizontal scaling, stateless |

**Summary:** [количество] критичных NFR

---

## 8. Assumptions

**Что предполагаем:**

1. [Предположение 1]
2. [Предположение 2]

**Что нужно уточнить у заказчика:**

1. [Вопрос 1]
2. [Вопрос 2]

---

## 9. Risks

| Тип          | Risk                      | Probability     | Impact          | Mitigation                     |
|--------------|---------------------------|-----------------|-----------------|--------------------------------|
| Технический  | [например "SPOF"]         | High/Medium/Low | High/Medium/Low | [например "репликация, LB"]    |
| Операционный | [например "нет rollback"] | High/Medium/Low | High/Medium/Low | [например "blue-green deploy"] |
