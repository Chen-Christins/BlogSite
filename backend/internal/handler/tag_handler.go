package handler

import (
	"blogsite/backend/internal/model"
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// ListTags returns all tags with post counts (public).
func (a *API) ListTags(c *gin.Context) {
	list, err := a.tags.List()
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OK(c, list)
}

// CreateTag adds a tag (admin).
func (a *API) CreateTag(c *gin.Context) {
	var in model.Tag
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	out, err := a.tags.Create(in)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, out)
}

// UpdateTag modifies a tag (admin).
func (a *API) UpdateTag(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	var in model.Tag
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	out, err := a.tags.Update(id, in)
	if err != nil {
		util.NotFound(c, "tag not found")
		return
	}
	util.OK(c, out)
}

// DeleteTag removes a tag (admin).
func (a *API) DeleteTag(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	if err := a.tags.Delete(id); err != nil {
		util.NotFound(c, "tag not found")
		return
	}
	util.OK(c, gin.H{"deleted": true})
}
