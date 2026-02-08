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

**Главная цель:**

- [Описание бизнес-цели]

**Ключевые метрики:**

- [Метрика 1, например "1M активных пользователей через 1 год"]
- [Метрика 2, например "$10M revenue через 6 месяцев"]

---

## 2. Functional Requirements (FR)

### FR-001: [Название функции]

**Priority:** High / Medium / Low

**User Story:**

```
As a [тип пользователя]
I want to [действие]
So that [цель/выгода]
```

**Acceptance Criteria:**

- [ ] Критерий 1
- [ ] Критерий 2

---

## 3. Non-Functional Requirements (NFR)

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

**Current State:**

- DAU: [число]
- Average RPS: [расчет]

**Peak Scenario: [Название]**

**Дано:**

- Peak DAU: [число]
- Requests per user: [число]
- Peak coefficient: [число]x
- Peak hours: [часы]

**Расчет Peak RPS:**

```
Peak RPS = (DAU × Req/user × Peak_coef) / (Peak_hours × 3600)
         = ([DAU] × [req] × [coef]) / ([hours] × 3600)
         = [результат] RPS
```

**Growth Forecast:**

- Year 1: [ожидаемый DAU и RPS]
- Year 3: [ожидаемый DAU и RPS]

---

## 5. Architecturally Significant NFR

| NFR ID  | Impact | Cost | Risk   | Critical? | Влияние на архитектуру        |
|---------|--------|------|--------|-----------|-------------------------------|
| NFR-P01 | High   | High | Medium | ✅ Yes     | CDN, caching, DB optimization |
| NFR-A01 | High   | High | High   | ✅ Yes     | Multi-AZ, replication, LB     |
| NFR-S01 | High   | High | Medium | ✅ Yes     | Horizontal scaling, stateless |

**Summary:** [количество] критичных NFR

---

## 6. Assumptions

**Что предполагаем:**

1. [Предположение 1]
2. [Предположение 2]

**Что нужно уточнить у заказчика:**

1. [Вопрос 1]
2. [Вопрос 2]

---

## 7. Risks

| Risk     | Probability     | Impact          | Mitigation |
|----------|-----------------|-----------------|------------|
| [Риск 1] | High/Medium/Low | High/Medium/Low | [Решение]  |
| [Риск 2] | High/Medium/Low | High/Medium/Low | [Решение]  |

