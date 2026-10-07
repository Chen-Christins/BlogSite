package handler

import (
	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
	"blogsite/backend/internal/service"
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// ListPosts returns published posts (public).
func (a *API) ListPosts(c *gin.Context) {
	page, size := pageParams(c)
	posts, total, err := a.posts.List(repository.PostFilter{
		Status:       model.PostStatusPublished,
		CategorySlug: c.Query("category"),
		TagSlug:      c.Query("tag"),
		Query:        c.Query("q"),
		Page:         page,
		Size:         size,
	})
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OKPage(c, posts, total, page, size)
}

// GetPost returns a published post by slug and records a view.
func (a *API) GetPost(c *gin.Context) {
	post, err := a.posts.GetPublishedBySlug(c.Param("slug"))
	if err != nil {
		util.NotFound(c, "post not found")
		return
	}
	util.OK(c, post)
}

// SearchPosts performs full-text search over published posts.
func (a *API) SearchPosts(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		util.BadRequest(c, "q is required")
		return
	}
	page, size := pageParams(c)
	posts, total, err := a.posts.List(repository.PostFilter{
		Status: model.PostStatusPublished,
		Query:  q,
		Page:   page,
		Size:   size,
	})
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OKPage(c, posts, total, page, size)
}

// AdminListPosts returns posts of any status (admin).
func (a *API) AdminListPosts(c *gin.Context) {
	page, size := pageParams(c)
	posts, total, err := a.posts.List(repository.PostFilter{
		Status: c.Query("status"),
		Query:  c.Query("q"),
		Page:   page,
		Size:   size,
	})
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OKPage(c, posts, total, page, size)
}

// GetAdminPost returns any post by id (admin).
func (a *API) GetAdminPost(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	post, err := a.posts.GetByID(id)
	if err != nil {
		util.NotFound(c, "post not found")
		return
	}
	util.OK(c, post)
}

// CreatePost creates a post (admin).
func (a *API) CreatePost(c *gin.Context) {
	var in service.PostInput
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	post, err := a.posts.Create(in)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, post)
}

// UpdatePost updates a post (admin).
func (a *API) UpdatePost(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	var in service.PostInput
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	post, err := a.posts.Update(id, in)
	if err != nil {
		if service.IsNotFound(err) {
			util.NotFound(c, "post not found")
			return
		}
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, post)
}

// DeletePost removes a post (admin).
func (a *API) DeletePost(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	if err := a.posts.Delete(id); err != nil {
		util.NotFound(c, "post not found")
		return
	}
	util.OK(c, gin.H{"deleted": true})
}

// PublishPost publishes a post (admin).
func (a *API) PublishPost(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	post, err := a.posts.Publish(id)
	if err != nil {
		util.NotFound(c, "post not found")
		return
	}
	util.OK(c, post)
}

// UnpublishPost reverts a post to draft (admin).
func (a *API) UnpublishPost(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	post, err := a.posts.Unpublish(id)
	if err != nil {
		util.NotFound(c, "post not found")
		return
	}
	util.OK(c, post)
}
