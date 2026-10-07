package storage

import (
	"context"
	"errors"

	"blogsite/backend/internal/config"
)

// S3Storage is a placeholder for a future S3/OSS/MinIO backend.
// Wire it up with the AWS SDK or minio-go when object storage is enabled.
type S3Storage struct {
	cfg config.S3StorageCfg
}

// NewS3Storage creates an S3-compatible storage (not yet implemented).
func NewS3Storage(cfg config.S3StorageCfg) (*S3Storage, error) {
	return &S3Storage{cfg: cfg}, nil
}

var errS3NotImplemented = errors.New("s3 storage is not implemented yet")

// Save is not implemented.
func (s *S3Storage) Save(_ context.Context, _ string, _ []byte) (string, error) {
	return "", errS3NotImplemented
}

// Delete is not implemented.
func (s *S3Storage) Delete(_ context.Context, _ string) error {
	return errS3NotImplemented
}

// URL returns the configured public base URL joined with key.
func (s *S3Storage) URL(key string) string {
	base := s.cfg.PublicBaseURL
	if base == "" {
		return key
	}
	return base + "/" + key
}
