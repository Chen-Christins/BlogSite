package handler

import (
	"blogsite/backend/internal/model"
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// ListCategories returns all categories (public).
func (a *API) ListCategories(c *gin.Context) {
	list, err := a.categories.List()
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OK(c, list)
}

// CreateCategory adds a category (admin).
func (a *API) CreateCategory(c *gin.Context) {
	var in model.Category
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	out, err := a.categories.Create(in)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, out)
}

// UpdateCategory modifies a category (admin).
func (a *API) UpdateCategory(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	var in model.Category
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	out, err := a.categories.Update(id, in)
	if err != nil {
		util.NotFound(c, "category not found")
		return
	}
	util.OK(c, out)
}

// DeleteCategory removes a category (admin).
func (a *API) DeleteCategory(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	if err := a.categories.Delete(id); err != nil {
		util.NotFound(c, "category not found")
		return
	}
	util.OK(c, gin.H{"deleted": true})
}
