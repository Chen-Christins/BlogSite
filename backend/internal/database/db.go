package database

import (
	"fmt"
	"time"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/model"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Connect opens a PostgreSQL connection using GORM.
func Connect(cfg *config.Config) (*gorm.DB, error) {
	logLevel := logger.Warn
	if cfg.App.Env == "development" {
		logLevel = logger.Info
	}

	db, err := gorm.Open(postgres.Open(cfg.Database.DSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logLevel),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	})
	if err != nil {
		return nil, fmt.Errorf("connect database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("get sql db: %w", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(50)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

// Migrate creates tables and required indexes / triggers.
func Migrate(db *gorm.DB) error {
	if err := db.AutoMigrate(
		&model.Post{},
		&model.Category{},
		&model.Tag{},
		&model.PostTag{},
		&model.Comment{},
		&model.Media{},
		&model.PageView{},
		&model.Setting{},
	); err != nil {
		return fmt.Errorf("auto migrate: %w", err)
	}

	if err := setupFullTextSearch(db); err != nil {
		return fmt.Errorf("setup full text search: %w", err)
	}
	return nil
}

// setupFullTextSearch creates the tsvector column, GIN index and trigger.
func setupFullTextSearch(db *gorm.DB) error {
	stmts := []string{
		`CREATE OR REPLACE FUNCTION posts_search_vector_update() RETURNS trigger AS $$
		BEGIN
			NEW.search_vector :=
				setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
				setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B') ||
				setweight(to_tsvector('simple', coalesce(NEW.content_md, '')), 'C');
			RETURN NEW;
		END
		$$ LANGUAGE plpgsql;`,
		`DROP TRIGGER IF EXISTS trg_posts_search_vector ON posts;`,
		`CREATE TRIGGER trg_posts_search_vector
			BEFORE INSERT OR UPDATE OF title, summary, content_md ON posts
			FOR EACH ROW EXECUTE FUNCTION posts_search_vector_update();`,
		`CREATE INDEX IF NOT EXISTS idx_posts_search_vector ON posts USING GIN (search_vector);`,
		`CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts (status, published_at DESC);`,
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_page_views_post_date ON page_views (post_id, date);`,
	}
	for _, s := range stmts {
		if err := db.Exec(s).Error; err != nil {
			return err
		}
	}
	return nil
}
