package handler

import (
	"strconv"

	"blogsite/backend/internal/service"
	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// ListComments returns approved comments for a post as a tree (public).
func (a *API) ListComments(c *gin.Context) {
	postID, err := strconv.ParseUint(c.Query("post_id"), 10, 64)
	if err != nil || postID == 0 {
		util.BadRequest(c, "post_id is required")
		return
	}
	tree, err := a.comments.ListApprovedTree(uint(postID))
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OK(c, tree)
}

// CreateComment submits a new comment (public, rate limited).
func (a *API) CreateComment(c *gin.Context) {
	var in service.CommentInput
	if err := c.ShouldBindJSON(&in); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	comment, err := a.comments.Create(in, c.ClientIP(), c.GetHeader("User-Agent"))
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, gin.H{
		"id":      comment.ID,
		"status":  comment.Status,
		"message": "comment submitted, pending moderation",
	})
}

// AdminListComments lists comments for moderation (admin).
func (a *API) AdminListComments(c *gin.Context) {
	page, size := pageParams(c)
	comments, total, err := a.comments.ListAll(c.Query("status"), page, size)
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OKPage(c, comments, total, page, size)
}

type commentStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

// UpdateCommentStatus changes a comment's moderation status (admin).
func (a *API) UpdateCommentStatus(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	var req commentStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		util.BadRequest(c, "status is required")
		return
	}
	if err := a.comments.UpdateStatus(id, req.Status); err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, gin.H{"updated": true})
}

// DeleteComment removes a comment (admin).
func (a *API) DeleteComment(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	if err := a.comments.Delete(id); err != nil {
		util.NotFound(c, "comment not found")
		return
	}
	util.OK(c, gin.H{"deleted": true})
}
