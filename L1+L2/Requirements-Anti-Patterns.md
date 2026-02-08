# Requirements Anti-Patterns

> Топ-3 ошибки при формулировке требований к highload системе
>
> Время: 7 минут

---

## Anti-Pattern #1: Vague Requirements (Расплывчато)

### ❌ Плохо

> "Система должна быть **быстрой**"
> "Нужна **высокая доступность**"
> "Должно **хорошо масштабироваться**"

### Проблема

- Что значит "быстро"? 10ms? 100ms? 1s?
- Невозможно проверить выполнение
- Невозможно спроектировать архитектуру

### ✅ Правильно

| Расплывчато             | Конкретно (SLI + SLO + условия)                                               |
|-------------------------|-------------------------------------------------------------------------------|
| "Быстро"                | **p95 latency < 200ms** для GET /api/products при 10K concurrent users        |
| "Высокая доступность"   | **99.9% uptime** (макс 8.76 часов простоя в год), SLI = % successful requests |
| "Хорошо масштабируется" | **Horizontal scaling до 100K RPS** через auto-scaling без изменения кода      |

### Формула

```
[SLI] [оператор] [SLO] [условия]

Примеры:
✅ p95 latency < 200ms при 10K concurrent users
✅ % successful requests > 99.9% при отказе любого 1 instance
✅ Throughput > 10K RPS при p95 latency < 500ms
```

---

## Anti-Pattern #2: Conflicting Requirements (Противоречия)

### ❌ Плохо

> "Нужна **99.99% availability** (43 минуты простоя в год)"
>
> + "Бюджет на infrastructure: **$500/месяц**"
>
> + "Команда: **2 junior разработчика**"

### Проблема

**99.99% availability требует:**

- Multi-AZ deployment (минимум 2-3 AZ)
- Load balancer с health checks
- Database replication (минимум 2 replicas)
- Auto-scaling, monitoring, alerts
- On-call rotation 24/7

**Реальная стоимость: $5K-10K/месяц минимум**

### ✅ Правильно

**Шаг 1: Выявить конфликт**

| Availability | Infrastructure Cost | Team Size             | Realistic?            |
|--------------|---------------------|-----------------------|-----------------------|
| 99.99%       | $10K/мес            | 5+ engineers + oncall | ❌ Конфликт с бюджетом |
| 99.9%        | $3K/мес             | 3-4 engineers         | ⚠️ Возможно           |
| 99.5%        | $1K/мес             | 2 engineers           | ✅ Достижимо           |

**Шаг 2: Trade-off analysis**

Вопросы для заказчика:

1. Сколько стоит 1 час простоя? (revenue loss, штрафы)
2. Можно ли увеличить бюджет или снизить availability?
3. Какие последствия downtime? (потеря лицензии, клиентов)

**Пример решение для банка:**

```
Анализ:
- 1 час простоя = ~$50K потерь + штраф ЦБ
- ЦБ требует min 99.5% availability

Решение:
✅ Target: 99.9% (SLA requirement)
✅ Budget: увеличить до $3K/мес (обоснование: штрафы дороже)
✅ Team: нанять 1 senior DevOps
✅ Компромисс: planned maintenance 3-5 AM
```

---

## Anti-Pattern #3: Missing Requirements (Недостающие)

### ❌ Плохо

Типичный Requirements Document для e-commerce:

```
Functional Requirements:
✅ FR-001: User registration
✅ FR-002: Product catalog
✅ FR-003: Shopping cart
✅ FR-004: Checkout

Non-Functional Requirements:
✅ NFR-P01: p95 latency < 200ms
✅ NFR-A01: 99.9% availability
```

### Проблема

**Что НЕ указано, но критично для highload:**

1. **Нагрузка:** Сколько DAU? Peak RPS? Seasonal spikes?
2. **Security:** Authentication? Encryption? Compliance (PCI DSS)?
3. **Scalability:** Scale-up или scale-out? Stateless design?
4. **Data consistency:** Strong или eventual? Replication strategy?
5. **Disaster recovery:** RPO? RTO? Backup strategy?

### ✅ Правильно

**Минимальный checklist для highload:**

- [ ] **Performance**
    - [ ] Latency (p50/p95/p99) для key operations
    - [ ] Throughput (RPS/TPS)

- [ ] **Load Calculations**
    - [ ] DAU/MAU
    - [ ] Average RPS
    - [ ] Peak RPS с расчетом для spike scenarios
    - [ ] Growth forecast (1 год, 3 года)

- [ ] **Availability**
    - [ ] Uptime SLO (99.x%)
    - [ ] Allowed downtime per year

- [ ] **Scalability**
    - [ ] Scale-up vs Scale-out (с обоснованием)
    - [ ] Scaling limits

- [ ] **Reliability**
    - [ ] Fault tolerance
    - [ ] Health checks + auto-restart

- [ ] **Security**
    - [ ] Authentication method
    - [ ] Encryption (TLS + at rest)

- [ ] **Disaster Recovery**
    - [ ] RPO (max data loss)
    - [ ] RTO (max recovery time)

---

## Как избежать этих ошибок

### Используйте Framework из лекции

Для каждого NFR оценить:

| Критерий                | High/Medium/Low                  |
|-------------------------|----------------------------------|
| **Impact на структуру** | Насколько влияет на архитектуру? |
| **Cost of Change**      | Можно ли добавить позже?         |
| **Business Risk**       | Что будет если не выполним?      |

**Правило:** Если 2 из 3 = High → архитектурно-значимый NFR

### Техника "5 Why"

Для каждого FR спросите: "Какие NFR нужны чтобы это работало?"

**Пример:**

```
FR-003: Shopping cart

→ Q: Какой latency допустим?
  A: NFR-P01: p95 < 500ms

→ Q: Что если сервер упадет с items in cart?
  A: NFR-R01: Cart state в Redis (не потеряем)

→ Q: Сколько одновременных пользователей?
  A: Load calculation: 50K DAU × 10 add-to-cart/day = ???

→ Q: Payment data — как защитить?
  A: NFR-SEC02: PCI DSS compliance + AES-256 encryption
```

---

## Чек-лист перед сдачей

### Completeness (Полнота)

- [ ] Все категории NFR присутствуют
- [ ] Load calculations выполнены (Peak RPS для spike scenarios)
- [ ] Growth forecast указан

### Specificity (Конкретность)

- [ ] Каждый NFR имеет SLI + SLO + условия
- [ ] Нет расплывчатых терминов ("быстро", "высокий")
- [ ] Latency указаны с percentiles (p95, p99)

### Consistency (Непротиворечивость)

- [ ] Нет conflicting requirements
- [ ] Budget соответствует infrastructure requirements
- [ ] Team size соответствует operational complexity

