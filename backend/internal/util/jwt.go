package util

import (
	"errors"
	"time"

	"blogsite/backend/internal/config"

	"github.com/golang-jwt/jwt/v5"
)

// Claims is the JWT payload for the admin user.
type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

// GenerateToken signs a JWT for the given admin username.
func GenerateToken(cfg *config.Config, username string) (string, time.Time, error) {
	expire := time.Now().Add(time.Duration(cfg.JWT.Expire) * time.Hour)
	claims := Claims{
		Username: username,
		RegisteredClaims: jwt.RegisteredClaims{
			Issuer:    cfg.JWT.Issuer,
			Subject:   username,
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			ExpiresAt: jwt.NewNumericDate(expire),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		return "", time.Time{}, err
	}
	return signed, expire, nil
}

// ParseToken validates a JWT and returns its claims.
func ParseToken(cfg *config.Config, tokenStr string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(cfg.JWT.Secret), nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}
