package handler

import (
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// GetSettings returns all site settings (public read).
func (a *API) GetSettings(c *gin.Context) {
	all, err := a.settings.All()
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OK(c, all)
}

// UpdateSettings upserts site settings (admin).
func (a *API) UpdateSettings(c *gin.Context) {
	var body map[string]string
	if err := c.ShouldBindJSON(&body); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	if err := a.settings.SetMany(body); err != nil {
		util.ServerError(c, err.Error())
		return
	}
	all, _ := a.settings.All()
	util.OK(c, all)
}
