package router

import (
	"time"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/handler"
	"blogsite/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

// Setup builds the Gin engine with routes and middleware.
func Setup(cfg *config.Config, api *handler.API) *gin.Engine {
	gin.SetMode(gin.ReleaseMode)
	if cfg.Server.Mode == "debug" {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()
	r.Use(middleware.Logger(), middleware.Recovery(), middleware.CORS())
	r.MaxMultipartMemory = 8 << 20

	// Serve locally stored uploads (local driver only).
	if cfg.Storage.Driver == "" || cfg.Storage.Driver == "local" {
		base := cfg.Storage.Local.BaseURL
		if base == "" {
			base = "/uploads"
		}
		r.Static(base, cfg.Storage.Local.Dir)
	}

	apiGroup := r.Group("/api")
	{
		apiGroup.GET("/health", api.Health)
		apiGroup.GET("/settings", api.GetSettings)

		apiGroup.GET("/posts", api.ListPosts)
		apiGroup.GET("/posts/:slug", api.GetPost)
		apiGroup.GET("/search", api.SearchPosts)

		apiGroup.GET("/categories", api.ListCategories)
		apiGroup.GET("/tags", api.ListTags)

		apiGroup.GET("/comments", api.ListComments)
		apiGroup.POST("/comments",
			middleware.RateLimit(cfg.Comment.RateLimitPerMin, time.Minute),
			api.CreateComment,
		)
	}

	admin := r.Group("/api/admin")
	admin.POST("/login", api.Login)

	auth := admin.Group("")
	auth.Use(middleware.JWTAuth(cfg))
	{
		auth.GET("/me", api.Me)

		auth.GET("/posts", api.AdminListPosts)
		auth.POST("/posts", api.CreatePost)
		auth.GET("/posts/:id", api.GetAdminPost)
		auth.PUT("/posts/:id", api.UpdatePost)
		auth.DELETE("/posts/:id", api.DeletePost)
		auth.POST("/posts/:id/publish", api.PublishPost)
		auth.POST("/posts/:id/unpublish", api.UnpublishPost)

		auth.GET("/categories", api.ListCategories)
		auth.POST("/categories", api.CreateCategory)
		auth.PUT("/categories/:id", api.UpdateCategory)
		auth.DELETE("/categories/:id", api.DeleteCategory)

		auth.GET("/tags", api.ListTags)
		auth.POST("/tags", api.CreateTag)
		auth.PUT("/tags/:id", api.UpdateTag)
		auth.DELETE("/tags/:id", api.DeleteTag)

		auth.GET("/comments", api.AdminListComments)
		auth.PUT("/comments/:id/status", api.UpdateCommentStatus)
		auth.DELETE("/comments/:id", api.DeleteComment)

		auth.POST("/upload", api.UploadMedia)
		auth.GET("/media", api.ListMedia)
		auth.DELETE("/media/:id", api.DeleteMedia)

		auth.GET("/stats/overview", api.StatsOverview)
		auth.PUT("/settings", api.UpdateSettings)
	}

	return r
}
