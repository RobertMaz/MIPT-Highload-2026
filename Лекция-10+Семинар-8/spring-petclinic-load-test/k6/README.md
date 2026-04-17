# k6 скрипты для Spring Petclinic

## Скрипты

| Скрипт      | Что тестирует                               | VU     | Время   | Когда запускать                      |
|-------------|---------------------------------------------|--------|---------|--------------------------------------|
| `smoke.js`  | "Вообще работает?"                          | 5      | 30 сек  | Каждый раз после `docker compose up` |
| `load.js`   | "Держит нормальную нагрузку?"               | 30     | 1.5 мин | Перед релизом                        |
| `stress.js` | "Где потолок?" (2 сценария: reads + writes) | 200+40 | 2.5 мин | Capacity planning                    |
| `spike.js`  | "Переживёт flash sale?"                     | 300    | 1.5 мин | Event-driven бизнес                  |

## Запуск

```bash
# Через обёртку (web dashboard + HTML-отчёт в k6/reports/)
./k6/run.sh smoke
./k6/run.sh stress
./k6/run.sh spike

# Или вручную
k6 run k6/smoke.js
K6_WEB_DASHBOARD=true k6 run k6/stress.js
K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=report.html k6 run k6/stress.js
```

