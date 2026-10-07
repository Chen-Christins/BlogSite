-- Initial schema for BlogSite
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    slug        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(512),
    sort        INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL UNIQUE,
    slug       VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS posts (
    id           BIGSERIAL PRIMARY KEY,
    title        VARCHAR(255) NOT NULL,
    slug         VARCHAR(255) NOT NULL UNIQUE,
    summary      TEXT,
    content_md   TEXT,
    content_html TEXT,
    cover_image  VARCHAR(512),
    category_id  BIGINT REFERENCES categories (id) ON DELETE SET NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    view_count   BIGINT NOT NULL DEFAULT 0,
    reading_time INTEGER NOT NULL DEFAULT 0,
    search_vector TSVECTOR,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN (search_vector);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id BIGINT NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    tag_id  BIGINT NOT NULL REFERENCES tags (id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id          BIGSERIAL PRIMARY KEY,
    post_id     BIGINT NOT NULL REFERENCES posts (id) ON DELETE CASCADE,
    parent_id   BIGINT REFERENCES comments (id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    email       VARCHAR(255),
    website     VARCHAR(255),
    content     TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'pending',
    ip          VARCHAR(64),
    user_agent  VARCHAR(512),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments (post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments (status);

CREATE TABLE IF NOT EXISTS media (
    id         BIGSERIAL PRIMARY KEY,
    filename   VARCHAR(255) NOT NULL,
    key        VARCHAR(512) NOT NULL,
    url        VARCHAR(512) NOT NULL,
    thumb_url  VARCHAR(512),
    mime       VARCHAR(100),
    size       BIGINT,
    width      INTEGER,
    height     INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS page_views (
    id      BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL,
    date    VARCHAR(10) NOT NULL,
    count   BIGINT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_page_views_post_date ON page_views (post_id, date);

CREATE TABLE IF NOT EXISTS settings (
    key        VARCHAR(100) PRIMARY KEY,
    value      TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Full text search trigger
CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.content_md, '')), 'C');
    RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_posts_search_vector ON posts;
CREATE TRIGGER trg_posts_search_vector
    BEFORE INSERT OR UPDATE OF title, summary, content_md ON posts
    FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();
