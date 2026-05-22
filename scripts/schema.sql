CREATE TABLE articles (
  id             VARCHAR(255) PRIMARY KEY,
  slug           VARCHAR(255) NOT NULL,
  category       VARCHAR(50)  NOT NULL,
  category_label VARCHAR(100) NOT NULL,
  title          VARCHAR(500) NOT NULL,
  summary        TEXT,
  icon           VARCHAR(10),
  icon_bg        VARCHAR(10),
  read_time      SMALLINT,
  likes          VARCHAR(20),
  author         VARCHAR(100),
  publish_date   DATE,
  body           TEXT         NOT NULL,
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- 优化查询索引
CREATE INDEX idx_articles_category ON articles(category);
CREATE UNIQUE INDEX idx_articles_category_slug ON articles(category, slug);
CREATE INDEX idx_articles_publish_date ON articles(publish_date DESC);