#!/bin/bash
# 逐批刷新 thelivinglook 文章缓存
# 每批 500 篇，通过 Vercel API route 处理

TOTAL=455776
BATCH=500
OFFSET=0
BASE_URL="https://thelivinglook.com/api/refresh-batch"
LOG_FILE="/root/vercel-projects/thelivinglook/logs/refresh-cache.log"

mkdir -p "$(dirname "$LOG_FILE")"

echo "[$(date)] Starting batch refresh. Total: $TOTAL, Batch: $BATCH" | tee "$LOG_FILE"

SUCCESS=0
FAIL=0

while [ $OFFSET -lt $TOTAL ]; do
  RESULT=$(curl -s -m 65 "${BASE_URL}?offset=${OFFSET}&limit=${BATCH}")
  
  OK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok', False))" 2>/dev/null)
  REFRESHED=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('refreshed', 0))" 2>/dev/null)
  ERROR=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('error', ''))" 2>/dev/null)
  
  if [ "$OK" = "True" ]; then
    SUCCESS=$((SUCCESS + REFRESHED))
    PCT=$(python3 -c "print(f'{($SUCCESS/$TOTAL)*100:.1f}')")
    echo "[$(date +%H:%M:%S)] offset=$OFFSET refreshed=$REFRESHED total_done=$SUCCESS ($PCT%)" | tee -a "$LOG_FILE"
  else
    FAIL=$((FAIL + 1))
    echo "[$(date +%H:%M:%S)] ERROR at offset=$OFFSET: $ERROR" | tee -a "$LOG_FILE"
    # 失败重试一次
    sleep 3
    RESULT=$(curl -s -m 65 "${BASE_URL}?offset=${OFFSET}&limit=${BATCH}")
    OK=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('ok', False))" 2>/dev/null)
    if [ "$OK" = "True" ]; then
      REFRESHED=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('refreshed', 0))" 2>/dev/null)
      SUCCESS=$((SUCCESS + REFRESHED))
      echo "[$(date +%H:%M:%S)] RETRY OK at offset=$OFFSET refreshed=$REFRESHED" | tee -a "$LOG_FILE"
    fi
  fi
  
  OFFSET=$((OFFSET + BATCH))
  
  # 每 10 批暂停 1 秒，避免过于激进
  if [ $((OFFSET / BATCH % 10)) -eq 0 ]; then
    sleep 1
  fi
done

echo "[$(date)] Done. Success: $SUCCESS, Failures: $FAIL, Total: $TOTAL" | tee -a "$LOG_FILE"
