# 8 Fallacies of Distributed Computing

> Краткий справочник — 8 классических заблуждений о распределенных системах
>
> Авторы: Peter Deutsch & James Gosling (Sun Microsystems), 1994

---

## Зачем нужны Fallacies?

При проектировании распределенных систем разработчики часто делают **неявные предположения**, которые верны для монолитных приложений, но *
*ложны для distributed систем**.

Эти 8 fallacies помогают:

- ✅ Избежать типичных ошибок архитектуры
- ✅ Понять откуда берутся проблемы в production
- ✅ Проектировать resilient системы

---

## 1. The network is reliable

### ❌ Заблуждение

Сеть всегда работает. Пакеты доходят. Соединения не рвутся.

### ✅ Реальность

- **1-5% packet loss** в реальных сетях
- **Outages cloud providers:** AWS, GCP, Azure падают несколько раз в год
- **Cable cuts:** кабели перерезают экскаваторы
- **DDoS attacks:** злоумышленники атакуют
- **Network congestion:** перегрузка сети в пики

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Retry с exponential backoff** (не просто retry 10 раз подряд!)
- ✅ **Circuit Breaker** (не долбить упавший сервис)
- ✅ **Idempotent operations** (можно безопасно повторить запрос)
- ✅ **Timeouts everywhere** (не ждать бесконечно)
- ✅ **Graceful degradation** (работать в ухудшенном режиме при проблемах)

**Пример:**

```java
// ❌ Плохо
PaymentResponse response = paymentService.charge(order);

// ✅ Хорошо
PaymentResponse response = Retry.ofExponentialBackoff(3, Duration.ofSeconds(1))
    .executeSupplier(() -> paymentService.charge(order));
```

---

## 2. Latency is zero

### ❌ Заблуждение

Вызов удаленного метода такой же быстрый как локальный.

### ✅ Реальность

| Операция                  | Latency        |
|---------------------------|----------------|
| CPU cache reference       | 1 ns           |
| RAM access                | 100 ns         |
| SSD read                  | 16 μs          |
| **LAN (same datacenter)** | **1-5 ms**     |
| **Same region (cloud)**   | **5-10 ms**    |
| **Cross-region**          | **50-200 ms**  |
| **Cross-continent**       | **100-300 ms** |

**Вызов локального метода:** ~1 ns
**Вызов через сеть (RPC):** ~5 ms = **5,000,000 ns** (в 5 миллионов раз медленнее!)

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Minimize network hops** (меньше remote calls)
- ✅ **Batch requests** (1 запрос с 100 items вместо 100 запросов)
- ✅ **Async где возможно** (не блокируем поток на ожидание)
- ✅ **Caching** (не ходить в сеть каждый раз)
- ✅ **Data locality** (данные рядом с compute)

**Антипаттерн:**

```java
// ❌ N+1 query problem
for(Order order :orders){
User user = userService.getUser(order.getUserId()); // N remote calls!
}

// ✅ Batch request
List<Long> userIds = orders.stream().map(Order::getUserId).collect(toList());
Map<Long, User> users = userService.getUsers(userIds); // 1 remote call
```

---

## 3. Bandwidth is infinite

### ❌ Заблуждение

Можно передавать сколько угодно данных по сети.

### ✅ Реальность

- **Typical network:** 1 Gbps
- **Saturation at peak:** возможна перегрузка канала
- **Cloud egress costs:** $0.05-0.12 per GB (дорого!)
- **Mobile networks:** медленные и дорогие для пользователя

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Pagination** (не передавать 1M records за раз)
- ✅ **Compression** (gzip/brotli для HTTP responses)
- ✅ **CDN для статики** (картинки, видео)
- ✅ **GraphQL** (клиент запрашивает только нужные поля)
- ✅ **Incremental updates** (delta sync вместо full sync)

**Пример:**

```http
// ❌ Плохо: 10MB JSON response
GET /api/products → [{"id":1, "name":"...", "description":"...", ...}, ...]

// ✅ Хорошо: Pagination + Compression
GET /api/products?page=1&limit=50
Response headers: Content-Encoding: gzip
```

---

## 4. The network is secure

### ❌ Заблуждение

Сеть безопасна. Данные не перехватят. Атак не будет.

### ✅ Реальность

- **MITM attacks** (Man-in-the-Middle)
- **DDoS attacks**
- **Data interception** (если нет шифрования)
- **Exploits** (уязвимости в сетевых протоколах)

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **TLS everywhere** (даже внутри датацентра!)
- ✅ **Authentication + Authorization** (не доверяй, проверяй)
- ✅ **Rate limiting** (защита от DDoS)
- ✅ **Input validation** (защита от injection attacks)
- ✅ **Zero Trust Architecture** (не доверяем даже internal network)

**Пример:**

```yaml
# ❌ Плохо: HTTP внутри кластера
http://order-service/api/orders

  # ✅ Хорошо: HTTPS + mTLS (mutual TLS)
https://order-service/api/orders
+ Client certificate authentication
```

---

## 5. Topology doesn't change

### ❌ Заблуждение

Топология сети фиксирована. IP-адреса не меняются. Серверы на месте.

### ✅ Реальность

- **K8s pods restart:** IP меняется
- **Auto-scaling:** pods появляются/исчезают
- **Deployments:** rolling updates = временная деградация
- **Cloud migrations:** перенос между датацентрами
- **Network failures:** маршруты меняются

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Service discovery** (не хардкод IP-адресов!)
- ✅ **DNS / Consul / K8s Service**
- ✅ **Health checks** (проверять доступность before routing)
- ✅ **Stateless apps** (pod можно убить без потери данных)
- ✅ **Connection pooling** (переиспользование соединений)

**Антипаттерн:**

```java
// ❌ Плохо: Hardcoded IP
String paymentServiceUrl = "http://192.168.1.42:8080";

// ✅ Хорошо: Service discovery
String paymentServiceUrl = "http://payment-service"; // K8s DNS
```

---

## 6. There is one administrator

### ❌ Заблуждение

Одна команда управляет всей инфраструктурой.

### ✅ Реальность

- **Multi-team:** разные команды владеют разными сервисами
- **Multi-cloud:** AWS + GCP + on-premise
- **Different vendors:** сторонние SaaS (Stripe, Twilio, etc.)
- **Разные SLA** у разных компонентов

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Clear ownership** (кто владеет каким сервисом?)
- ✅ **Monitoring + Alerting** (каждая команда мониторит свое)
- ✅ **SLO/SLA contracts** (явные договоренности между командами)
- ✅ **Documentation** (README, runbooks, ADR)
- ✅ **On-call rotation** (кто отвечает за incidents?)

**Пример:**

```markdown
# Service: Payment Service

Owner: Team Payments
SLA: 99.9% availability
On-call: PagerDuty rotation "payments-team"
Dependencies:

- Stripe API (external, 99.99% SLA)
- Order Service (Team Orders, 99.9% SLA)
```

---

## 7. Transport cost is zero

### ❌ Заблуждение

Передача данных по сети бесплатна.

### ✅ Реальность

- **Cloud egress:** $0.05-0.12 per GB (AWS, GCP, Azure)
- **CDN costs:** $0.02-0.10 per GB
- **Bandwidth limits:** провайдеры могут ограничивать
- **Cross-region transfer:** дороже чем within region

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Optimize data transfer** (не гоняй лишние данные)
- ✅ **Choose regions wisely** (compute рядом с данными)
- ✅ **CDN для статики** (offload от origin servers)
- ✅ **Compression** (меньше байт = меньше денег)
- ✅ **Cost monitoring** (alerts на spike в traffic)

**Пример расчета:**

```
E-commerce маркетплейс:
- 50K RPS peak (Черная Пятница)
- Average response: 10KB
- Traffic: 50,000 RPS × 10KB × 3600s × 24h × 3 дней = 129.6 TB

AWS egress cost:
- First 10TB: $0.09/GB = $900
- Next 40TB: $0.085/GB = $3,400
- Next 79.6TB: $0.07/GB = $5,572

Total egress: ~$9,872 за 3 дня ЧП! 💸
```

---

## 8. The network is homogeneous

### ❌ Заблуждение

Все используют одинаковые протоколы, версии, технологии.

### ✅ Реальность

- **Mix протоколов:** HTTP/1.1, HTTP/2, gRPC, WebSocket
- **Different versions:** API v1, v2, v3 одновременно
- **Legacy systems:** старые сервисы на SOAP
- **Разные языки:** Java, Go, Python, Node.js

### 🛠 Последствия для архитектуры

**Что делать:**

- ✅ **Protocol negotiation** (content-type headers)
- ✅ **Backward compatibility** (не ломать старых клиентов)
- ✅ **API versioning** (/api/v1/, /api/v2/)
- ✅ **Adapters/Wrappers** для legacy
- ✅ **Contract testing** (проверить что API contracts не сломались)

**Пример:**

```http
// Клиент указывает что поддерживает
Accept: application/json, application/xml
Accept-Encoding: gzip, br

// Сервер отвечает что использует
Content-Type: application/json
Content-Encoding: gzip
```

---

## Checklist для проектирования distributed систем

Проверьте каждый fallacy:

- [ ] **Network reliability:** Есть retry + circuit breaker + timeouts?
- [ ] **Latency:** Минимизировали network hops? Есть batching? Async где можно?
- [ ] **Bandwidth:** Есть pagination? Compression? CDN?
- [ ] **Security:** TLS? Authentication? Rate limiting?
- [ ] **Topology changes:** Service discovery? Health checks? Stateless?
- [ ] **Multiple admins:** Clear ownership? SLO contracts? Documentation?
- [ ] **Transport cost:** Cost monitoring? Optimization? Compression?
- [ ] **Heterogeneity:** API versioning? Backward compatibility? Protocol negotiation?

---

## Цитата (Leslie Lamport)

> "A distributed system is one in which the failure of a computer you didn't even know existed can render your own computer unusable."

**Перевод:**
"Распределенная система — это когда отказ компьютера, о существовании которого ты не знал, может сделать твой компьютер бесполезным."

## Ресурсы

**Оригинальная статья:**

- [8 Fallacies of Distributed Computing Explained](https://en.wikipedia.org/wiki/Fallacies_of_distributed_computing)

**Дополнительно:**

- "Designing Data-Intensive Applications" (Martin Kleppmann) — Ch 8
- "Release It!" (Michael Nygard) — Stability Patterns

