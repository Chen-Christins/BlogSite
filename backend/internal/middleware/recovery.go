package middleware

import (
	"net/http"

	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

// Recovery recovers from panics and returns a 500 response.
func Recovery() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if r := recover(); r != nil {
				log.Error().Interface("panic", r).Str("path", c.Request.URL.Path).Msg("recovered from panic")
				util.ServerError(c, "internal server error")
				c.AbortWithStatus(http.StatusInternalServerError)
			}
		}()
		c.Next()
	}
}
