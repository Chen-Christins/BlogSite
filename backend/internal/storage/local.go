package storage

import (
	"context"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
)

// LocalStorage stores objects on the local filesystem.
type LocalStorage struct {
	dir     string
	baseURL string
}

// NewLocalStorage creates a local filesystem storage.
func NewLocalStorage(dir, baseURL string) (*LocalStorage, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create storage dir: %w", err)
	}
	return &LocalStorage{
		dir:     strings.TrimRight(dir, "/"),
		baseURL: strings.TrimRight(baseURL, "/"),
	}, nil
}

// Save writes data to the local filesystem.
func (s *LocalStorage) Save(_ context.Context, key string, data []byte) (string, error) {
	full := filepath.Join(s.dir, filepath.FromSlash(key))
	if err := os.MkdirAll(filepath.Dir(full), 0o755); err != nil {
		return "", err
	}
	if err := os.WriteFile(full, data, 0o644); err != nil {
		return "", err
	}
	return s.URL(key), nil
}

// Delete removes a file from disk.
func (s *LocalStorage) Delete(_ context.Context, key string) error {
	full := filepath.Join(s.dir, filepath.FromSlash(key))
	err := os.Remove(full)
	if os.IsNotExist(err) {
		return nil
	}
	return err
}

// URL returns the public URL for a key.
func (s *LocalStorage) URL(key string) string {
	return path.Join(s.baseURL, key)
}
