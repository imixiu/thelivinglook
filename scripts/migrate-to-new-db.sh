#!/bin/bash
# 迁移 thelivinglook 数据到独立数据库

set -e

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 检查参数
if [ -z "$1" ]; then
  echo "Usage: $0 <NEW_DATABASE_URL>"
  echo "Example: $0 'postgresql://user:pass@host/dbname'"
  exit 1
fi

OLD_DB="postgresql://neondb_owner:npg_HKw8qxGg5cfj@ep-fancy-leaf-a4zukau9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEW_DB="$1"

echo -e "${GREEN}=== 步骤 1: 创建新数据库表结构 ===${NC}"
psql "$NEW_DB" <<'SQL'
CREATE TABLE IF NOT EXISTS articles (
  id SERIAL PRIMARY KEY,
  site VARCHAR(255),
  type VARCHAR(50),
  short_title VARCHAR(255),
  title TEXT,
  description TEXT,
  body TEXT,
  img TEXT,
  url TEXT UNIQUE,
  author VARCHAR(255),
  language VARCHAR(10),
  published_time TIMESTAMP,
  modified_time TIMESTAMP,
  is_online VARCHAR DEFAULT 'Y' NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_articles_site ON articles(site);
CREATE INDEX IF NOT EXISTS idx_articles_site_type ON articles(site, type);
CREATE INDEX IF NOT EXISTS idx_articles_site_short_title ON articles(site, short_title);
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_site_short_title_unique ON articles(site, short_title);
SQL

echo -e "${GREEN}=== 步骤 2: 统计源数据量 ===${NC}"
TOTAL=$(psql "$OLD_DB" -t -c "SELECT COUNT(*) FROM articles WHERE site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y')")
echo "需要迁移 $TOTAL 条记录"

echo -e "${GREEN}=== 步骤 3: 分批迁移数据 ===${NC}"
BATCH_SIZE=5000
OFFSET=0

while true; do
  echo -e "${YELLOW}迁移 offset=$OFFSET, limit=$BATCH_SIZE${NC}"

  # 导出批次数据到临时文件
  psql "$OLD_DB" -c "\COPY (SELECT * FROM articles WHERE site = 'thelivinglook' AND (is_online IS NULL OR is_online = 'Y') ORDER BY id LIMIT $BATCH_SIZE OFFSET $OFFSET) TO '/tmp/articles_batch.csv' CSV HEADER"

  # 导入到新数据库
  psql "$NEW_DB" -c "\COPY articles FROM '/tmp/articles_batch.csv' CSV HEADER"

  OFFSET=$((OFFSET + BATCH_SIZE))

  # 检查是否完成
  if [ $OFFSET -ge $TOTAL ]; then
    break
  fi

  sleep 1
done

rm -f /tmp/articles_batch.csv

echo -e "${GREEN}=== 步骤 4: 验证迁移结果 ===${NC}"
NEW_TOTAL=$(psql "$NEW_DB" -t -c "SELECT COUNT(*) FROM articles WHERE site = 'thelivinglook'")
echo "新数据库记录数: $NEW_TOTAL"
echo "原数据库记录数: $TOTAL"

if [ "$NEW_TOTAL" -eq "$TOTAL" ]; then
  echo -e "${GREEN}✓ 迁移成功！${NC}"
else
  echo -e "${YELLOW}⚠ 记录数不匹配，请检查${NC}"
fi

echo -e "${GREEN}=== 完成 ===${NC}"
echo "下一步："
echo "1. 更新 Vercel 环境变量 DATABASE_URL 为新数据库"
echo "2. 重新部署站点"
