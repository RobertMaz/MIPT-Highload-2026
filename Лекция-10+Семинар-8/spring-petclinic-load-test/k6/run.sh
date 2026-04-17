#!/bin/bash
# Запуск k6 с web dashboard + HTML export
# Использование: ./k6/run.sh smoke|load|stress|spike

SCRIPT="${1:-smoke}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT="k6/reports/${SCRIPT}_${TIMESTAMP}.html"

mkdir -p k6/reports

K6_WEB_DASHBOARD=true \
K6_WEB_DASHBOARD_EXPORT="$REPORT" \
k6 run "k6/${SCRIPT}.js"

echo ""
echo "Отчёт сохранён: $REPORT"
