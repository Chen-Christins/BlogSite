package handler

import (
	"io"

	"blogsite/backend/internal/util"

	"github.com/gin-gonic/gin"
)

// UploadMedia handles multipart file upload with compression (admin).
func (a *API) UploadMedia(c *gin.Context) {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		util.BadRequest(c, "file is required")
		return
	}
	f, err := fileHeader.Open()
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}

	media, err := a.media.Upload(c.Request.Context(), fileHeader.Filename, data)
	if err != nil {
		util.BadRequest(c, err.Error())
		return
	}
	util.OK(c, media)
}

// ListMedia returns paginated uploads (admin).
func (a *API) ListMedia(c *gin.Context) {
	page, size := pageParams(c)
	list, total, err := a.media.List(page, size)
	if err != nil {
		util.ServerError(c, err.Error())
		return
	}
	util.OKPage(c, list, total, page, size)
}

// DeleteMedia removes an upload (admin).
func (a *API) DeleteMedia(c *gin.Context) {
	id, ok := parseID(c)
	if !ok {
		util.BadRequest(c, "invalid id")
		return
	}
	if err := a.media.Delete(c.Request.Context(), id); err != nil {
		util.NotFound(c, "media not found")
		return
	}
	util.OK(c, gin.H{"deleted": true})
}
