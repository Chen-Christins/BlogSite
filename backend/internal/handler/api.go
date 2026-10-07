package handler

import (
	"strconv"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/service"
	"blogsite/backend/internal/storage"

	"github.com/gin-gonic/gin"
)

// API aggregates all HTTP handlers and their dependencies.
type API struct {
	cfg        *config.Config
	auth       *service.AuthService
	posts      *service.PostService
	categories *service.CategoryService
	tags       *service.TagService
	comments   *service.CommentService
	media      *service.MediaService
	stats      *service.StatsService
	settings   *service.SettingService
	storage    storage.Storage
}

// New creates an API handler container.
func New(
	cfg *config.Config,
	auth *service.AuthService,
	posts *service.PostService,
	categories *service.CategoryService,
	tags *service.TagService,
	comments *service.CommentService,
	media *service.MediaService,
	stats *service.StatsService,
	settings *service.SettingService,
	st storage.Storage,
) *API {
	return &API{
		cfg:        cfg,
		auth:       auth,
		posts:      posts,
		categories: categories,
		tags:       tags,
		comments:   comments,
		media:      media,
		stats:      stats,
		settings:   settings,
		storage:    st,
	}
}

func pageParams(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("size", "10"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 10
	}
	return page, size
}

func parseID(c *gin.Context) (uint, bool) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id == 0 {
		return 0, false
	}
	return uint(id), true
}
