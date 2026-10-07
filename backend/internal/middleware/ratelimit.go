package middleware

import (
	"sync"
	"time"

	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

type rateEntry struct {
	count int
	reset time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]*rateEntry
	limit   int
	window  time.Duration
}

// RateLimit returns an in-memory per-IP rate limiting middleware.
func RateLimit(limit int, window time.Duration) gin.HandlerFunc {
	rl := &rateLimiter{
		entries: make(map[string]*rateEntry),
		limit:   limit,
		window:  window,
	}
	go rl.cleanup()
	return func(c *gin.Context) {
		if !rl.allow(c.ClientIP()) {
			util.Fail(c, 429, 42900, "too many requests, please slow down")
			c.Abort()
			return
		}
		c.Next()
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	now := time.Now()
	e, ok := rl.entries[ip]
	if !ok || now.After(e.reset) {
		rl.entries[ip] = &rateEntry{count: 1, reset: now.Add(rl.window)}
		return true
	}
	if e.count >= rl.limit {
		return false
	}
	e.count++
	return true
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()
		rl.mu.Lock()
		for ip, e := range rl.entries {
			if now.After(e.reset) {
				delete(rl.entries, ip)
			}
		}
		rl.mu.Unlock()
	}
}
