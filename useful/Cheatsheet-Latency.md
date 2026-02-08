# Latency Numbers Every Programmer Should Know

Полезные числа для capacity estimation и архитектурных решений.

---

## Операции

| Операция                   | Время  | Заметки                   |
|----------------------------|--------|---------------------------|
| L1 cache reference         | 1 ns   |                           |
| L2 cache reference         | 4 ns   |                           |
| RAM reference              | 100 ns |                           |
| SSD random read            | 16 μs  |                           |
| HDD random read            | 2 ms   | В 125 раз медленнее SSD   |
| HDD sequential read (1 MB) | 2 ms   | Sequential быстрее random |
| SSD sequential read (1 MB) | 250 μs |                           |
| Round trip в одном DC      | 500 μs |                           |
| Round trip EU → US         | 150 ms | Физика, скорость света    |

## Сеть

| Операция                    | Время     |
|-----------------------------|-----------|
| Ping localhost              | 0.05 ms   |
| Ping в одном DC             | 0.5 ms    |
| Ping cross-DC (один регион) | 1-5 ms    |
| Ping cross-region           | 50-150 ms |

## Базы данных

| Операция                  | Время      | Заметки           |
|---------------------------|------------|-------------------|
| Redis GET                 | 0.1-0.5 ms | In-memory         |
| PostgreSQL simple query   | 1-5 ms     | С индексом        |
| PostgreSQL complex query  | 10-100 ms  | Зависит от данных |
| Full table scan (1M rows) | 1-10 s     | Avoid!            |

## Throughput

| Операция             | Пропускная способность |
|----------------------|------------------------|
| SSD sequential write | 500 MB/s               |
| HDD sequential write | 100 MB/s               |
| 1 Gbps network       | 125 MB/s               |
| 10 Gbps network      | 1.25 GB/s              |

---

## Правила большого пальца

1. **Memory > SSD > HDD** — всегда
2. **Sequential > Random** — для дисков это критично
3. **Сеть — главный bottleneck** в распределённых системах
4. **Cross-region = 100+ ms** — учитывай для UX
5. **Кэшируй** — разница между 100ns (RAM) и 5ms (DB) = 50000x

---

## Capacity Estimation Quick Math

```
1 день = 86400 секунд ≈ 100k секунд
1 год = 365 дней ≈ 400 дней (для простоты)

Если 1M DAU и каждый делает 10 запросов:
- 10M запросов/день
- 10M / 100k = 100 RPS average
- Peak = 3-5x average = 300-500 RPS
```

---

## Источники

- [Latency Numbers Everyone Should Know](https://static.googleusercontent.com/media/sre.google/ru//static/pdf/rule-of-thumb-latency-numbers-letter.pdf)
