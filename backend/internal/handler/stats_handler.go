package handler

import (
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// StatsOverview returns dashboard statistics (admin).
func (a *API) StatsOverview(c *gin.Context) {
	overview, err := a.stats.GetOverview()
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OK(c, overview)
}
