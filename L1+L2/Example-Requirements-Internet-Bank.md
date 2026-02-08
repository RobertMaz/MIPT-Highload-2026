# Requirements Example: Интернет-банк ДБО

> Краткий пример Requirements Document для C1
>
> Кейс: Дистанционное банковское обслуживание (ДБО)

---

## 1. Business Goals

**Главная цель:**
Предоставить клиентам возможность совершать операции онлайн 24/7

**Ключевые метрики:**

- 30,000 активных пользователей через 6 месяцев (из 50,000 клиентов)
- p95 latency < 500ms
- 99.95% availability (требование ЦБ РФ)

**Ограничения:**

- Бюджет infrastructure: $15,000/месяц
- Команда: 5 человек (2 backend, 1 frontend, 1 DevOps, 1 QA)
- Срок MVP: 3 месяца

---

## 2. Functional Requirements (краткий список)

**High Priority:**

- FR-001: Аутентификация (логин + SMS 2FA)
- FR-002: Просмотр баланса счетов
- FR-003: Переводы между своими счетами
- FR-004: Платежи (ЖКХ, мобильная связь, интернет)

**Medium Priority:**

- FR-005: История операций
- FR-006: Открытие вклада онлайн

---

## 3. Non-Functional Requirements (NFR)

### NFR-P01: Transaction Latency

**SLI:** p95 latency для POST /api/transactions
**SLO:** < 500ms при peak load (52 RPS)

**Framework оценка:**

- **Impact:** High — медленные переводы = отток клиентов, негативные отзывы
- **Cost of Change:** Medium — можно оптимизировать позже (DB indexes, connection pooling)
- **Business Risk:** Medium — конкуренты быстрее (Тинькофф, Сбер)

**Архитектурно-значимый:** ✅ Да (2 из 3 = High)

**Влияние на архитектуру:**

- Database indexes на transaction queries
- Connection pooling (pgBouncer)
- Redis cache для баланса счетов
- Monitoring с alerts на p95 > 500ms

---

### NFR-A01: Availability

**SLI:** % successful API responses (HTTP 200-299) за месяц
**SLO:** ≥ 99.5% (макс 3.65 часов downtime/месяц)

**Обоснование выбора 99.5% (не 99.9%):**

- ЦБ РФ требует минимум 99.5% для ДБО
- 99.9% требует multi-AZ + $25K/мес infrastructure
- Текущий бюджет: $15K/мес
- Компромисс: planned maintenance 3-5 AM

**Framework оценка:**

- **Impact:** High — downtime = штраф ЦБ + потеря клиентов + репутация
- **Cost of Change:** High — архитектура должна учитывать с первого дня (нельзя добавить HA после запуска)
- **Business Risk:** High — регуляторный риск (потеря лицензии ЦБ)

**Архитектурно-значимый:** ✅ Да (3 из 3 = High)

**Влияние на архитектуру:**

- Health checks + auto-restart (Kubernetes)
- Database replication: 1 master + 1 standby
- Backup каждый час (RPO = 1 hour)
- Monitoring + oncall rotation

---

### NFR-S01: Scalability Strategy

**Выбор:** Scale-up (вертикальное масштабирование)

**Обоснование:**

- **Нагрузка:** 52 RPS peak (LOW) — один сервер справится
- **Availability:** 99.5% достижима с single instance + fast restart
- **Бюджет:** $15K/мес — scale-up дешевле чем multi-instance
- **Команда:** 5 человек — простота важнее распределенности
- **ACID:** Банковские транзакции требуют ACID → PostgreSQL single instance проще

**SLO:**

- Поддерживать peak load (52 RPS) на 1 instance
- Вертикальный резерв: до 150 RPS (3x growth = 3 года запаса)
- Конфигурация: 16 cores, 64GB RAM, SSD

**Когда пересмотреть:**

- Если RPS > 100 (приближение к saturation)
- Если availability requirement повысится до 99.9%

**Архитектурно-значимый:** ✅ Да (2 из 3 = High)

---

### NFR-SEC01: Security & Compliance

**Требования:**

- [ ] 152-ФЗ: данные граждан РФ хранятся в РФ data centers
- [ ] ЦБ РФ: аудит кода третьей стороной
- [ ] PCI DSS Level 1 (если свой acquiring)
- [ ] TLS 1.3 для всех API endpoints
- [ ] AES-256 encryption at rest для sensitive data

**Framework оценка:**

- **Impact:** High — требует on-premise deployment, encrypted storage, audit trails
- **Cost:** High — нельзя добавить потом (архитектура security с первого дня)
- **Risk:** Critical — потеря лицензии, штрафы, уголовная ответственность

**Архитектурно-значимый:** ✅ Да (3 из 3 = High)

**Technology Constraint:**

- On-premise deployment (no AWS/GCP)
- Reason: 152-ФЗ + банковская лицензия
- Impact: Self-hosted infrastructure, no managed services

---

## 4. Load Calculations

### Current State

**Пользователи:**

- Всего клиентов банка: 50,000
- Ожидается активных в ДБО: 30,000 (60% adoption)
- DAU (daily active): 15,000 (50% от активных)

**Операции:**

- Вход в систему: 1 раз/день
- Просмотр баланса: 2 раза/день
- Платежи/переводы: 2 раза/день
- **Итого:** 5 операций/пользователь/день

### Peak Scenario: Зарплатные дни

**Когда:**

- Даты: 10-15 число каждого месяца
- Время пика: 10:00-14:00 (4 часа обеденное время)

**Параметры:**

- Peak DAU: 30,000 клиентов (все активные)
- Operations: 5 транзакций/пользователь
- Peak coefficient: 3x (зарплата → активность в 3 раза выше)
- Peak hours: 4 часа

### Расчет Peak RPS

```
Average RPS = DAU × Operations / 86400
            = 15,000 × 5 / 86,400
            = 0.87 RPS (очень низкая средняя нагрузка)

Peak RPS = (Peak_DAU × Operations × Peak_coef) / (Peak_hours × 3600)
         = (30,000 × 5 × 3) / (4 × 3600)
         = 450,000 / 14,400
         = 31 RPS (округляем до 50 RPS для запаса)
```

**Вывод:**
Пиковая нагрузка ~31 RPS — это **LOW для highload в абсолютных числах**.

НО для банка это **критичная система** из-за:

- Availability: 99.5% (regulatory)
- Latency: < 500ms (UX)
- Security: PCI DSS, 152-ФЗ, audit

→ **Highload ≠ только RPS. Важны NFR!**

### Growth Forecast

**Year 1:**

- Expected DAU: 20,000 (+33%)
- Expected Peak RPS: 42 RPS
- Infrastructure: текущая справится

**Year 3:**

- Expected DAU: 30,000 (+100%)
- Expected Peak RPS: 62 RPS
- Infrastructure: текущая справится (резерв до 150 RPS)

---

## 5. Architecturally Significant NFR (Summary)

| NFR ID    | Category     | Impact | Cost   | Risk     | Critical? |
|-----------|--------------|--------|--------|----------|-----------|
| NFR-P01   | Performance  | High   | Medium | Medium   | ✅ Yes     |
| NFR-A01   | Availability | High   | High   | High     | ✅ Yes     |
| NFR-S01   | Scalability  | High   | High   | Medium   | ✅ Yes     |
| NFR-SEC01 | Security     | High   | High   | Critical | ✅ Yes     |

**Критичных NFR:** 4 из 4

**Основное влияние на архитектуру:**

- Scale-up architecture (single powerful instance)
- PostgreSQL with replication
- On-premise deployment (security compliance)
- Health checks + auto-restart
- Monitoring + alerts

---

## 6. Assumptions

**Что предполагаем:**

1. Клиенты равномерно распределены по времени в пиковые часы (10-14)
2. Средний размер запроса ~5KB
3. 80% операций = read (баланс), 20% = write (платежи)

**Что нужно уточнить у заказчика:**

1. Планируется ли выход в другие регионы? (влияет на масштабирование)
2. Есть ли legacy системы для интеграции? (АБС, процессинг)
3. Бюджет на инфраструктуру может быть увеличен при росте?

---

## 7. Risks

| Risk                                                  | Probability | Impact   | Mitigation                                          |
|-------------------------------------------------------|-------------|----------|-----------------------------------------------------|
| Недостаточная производительность PostgreSQL при росте | Medium      | High     | Prepared statements, connection pooling, monitoring |
| SPOF в single instance                                | High        | Critical | Health checks, auto-restart, standby replica готова |
| Превышение бюджета infrastructure                     | Low         | Medium   | Start minimal, scale-up only when needed            |
| Не успеем к deadline (3 мес MVP)                      | Medium      | High     | MVP scope reduction, focus на FR-001 до FR-004      |
