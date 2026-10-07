package middleware

import (
	"strings"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// ContextUsername is the gin context key for the authenticated admin username.
const ContextUsername = "auth_username"

// JWTAuth validates the Bearer token on protected routes.
func JWTAuth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" {
			util.Unauthorized(c, "missing authorization header")
			c.Abort()
			return
		}
		parts := strings.SplitN(header, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			util.Unauthorized(c, "invalid authorization header")
			c.Abort()
			return
		}
		claims, err := util.ParseToken(cfg, parts[1])
		if err != nil {
			util.Unauthorized(c, "invalid or expired token")
			c.Abort()
			return
		}
		c.Set(ContextUsername, claims.Username)
		c.Next()
	}
}
