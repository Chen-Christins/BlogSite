package service

import (
	"errors"
	"time"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/util"
)

// AuthService handles admin authentication.
type AuthService struct {
	cfg          *config.Config
	passwordHash string
}

// NewAuthService creates an AuthService, hashing the plaintext password if needed.
func NewAuthService(cfg *config.Config) (*AuthService, error) {
	hash := cfg.Admin.PasswordHash
	if hash == "" {
		if cfg.Admin.Password == "" {
			return nil, errors.New("admin password not configured")
		}
		h, err := util.HashPassword(cfg.Admin.Password)
		if err != nil {
			return nil, err
		}
		hash = h
	}
	return &AuthService{cfg: cfg, passwordHash: hash}, nil
}

// Login validates credentials and returns a signed JWT.
func (s *AuthService) Login(username, password string) (string, time.Time, error) {
	if username != s.cfg.Admin.Username || !util.CheckPassword(s.passwordHash, password) {
		return "", time.Time{}, errors.New("invalid username or password")
	}
	return util.GenerateToken(s.cfg, username)
}
