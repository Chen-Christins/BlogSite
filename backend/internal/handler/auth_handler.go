package handler

import (
	"net/http"

	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// Health reports service liveness.
func (a *API) Health(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

type loginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// Login authenticates the admin and returns a JWT.
func (a *API) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "username and password are required")
		return
	}
	token, expire, err := a.auth.Login(req.Username, req.Password)
	if err != nil {
		util.Unauthorized(c, err.Error())
		return
	}
	util.OK(c, gin.H{
		"token":      token,
		"expires_at": expire,
		"username":   req.Username,
	})
}

// Me returns the current authenticated admin.
func (a *API) Me(c *gin.Context) {
	username, _ := c.Get("auth_username")
	util.OK(c, gin.H{"username": username})
}
