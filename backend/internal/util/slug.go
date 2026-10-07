package util

import (
	"crypto/rand"
	"math/big"
	"strings"
	"unicode"
)

// Slugify converts a title into a URL-friendly slug.
// It keeps unicode letters/digits and replaces separators with dashes.
func Slugify(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	var b strings.Builder
	lastDash := false
	for _, r := range s {
		switch {
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
			lastDash = false
		case r == ' ' || r == '-' || r == '_' || r == '.' || r == '/' || r == '\\':
			if !lastDash && b.Len() > 0 {
				b.WriteRune('-')
				lastDash = true
			}
		default:
			// skip other punctuation
		}
	}
	out := strings.Trim(b.String(), "-")
	return out
}

const randChars = "abcdefghijklmnopqrstuvwxyz0123456789"

// RandomString returns a random lowercase alphanumeric string of length n.
func RandomString(n int) string {
	b := make([]byte, n)
	for i := range b {
		idx, err := rand.Int(rand.Reader, big.NewInt(int64(len(randChars))))
		if err != nil {
			b[i] = randChars[0]
			continue
		}
		b[i] = randChars[idx.Int64()]
	}
	return string(b)
}
