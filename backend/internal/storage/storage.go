package storage

import (
	"context"
	"fmt"

	"blogsite/backend/internal/config"
)

// Storage abstracts a file storage backend (local disk, S3/OSS, ...).
type Storage interface {
	// Save persists data under key and returns its public URL.
	Save(ctx context.Context, key string, data []byte) (string, error)
	// Delete removes the object identified by key.
	Delete(ctx context.Context, key string) error
	// URL returns the public URL for key.
	URL(key string) string
}

// NewStorage builds a Storage from configuration.
func NewStorage(cfg *config.Config) (Storage, error) {
	switch cfg.Storage.Driver {
	case "", "local":
		return NewLocalStorage(cfg.Storage.Local.Dir, cfg.Storage.Local.BaseURL)
	case "s3":
		return NewS3Storage(cfg.Storage.S3)
	default:
		return nil, fmt.Errorf("unsupported storage driver: %s", cfg.Storage.Driver)
	}
}
