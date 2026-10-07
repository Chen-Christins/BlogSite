package service

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"image"
	"path/filepath"
	"strings"
	"time"

	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
	"blogsite/backend/internal/storage"
	"blogsite/backend/internal/util"

	"github.com/disintegration/imaging"
)

const (
	maxImageWidth  = 1920
	thumbMaxWidth  = 480
	maxUploadBytes = 10 << 20 // 10 MB
)

// MediaService handles uploads, compression and thumbnails.
type MediaService struct {
	repo    *repository.MediaRepository
	storage storage.Storage
}

// NewMediaService creates a MediaService.
func NewMediaService(repo *repository.MediaRepository, st storage.Storage) *MediaService {
	return &MediaService{repo: repo, storage: st}
}

// Upload stores a file, compressing images and generating thumbnails when possible.
func (s *MediaService) Upload(ctx context.Context, filename string, data []byte) (*model.Media, error) {
	if len(data) == 0 {
		return nil, errors.New("empty file")
	}
	if len(data) > maxUploadBytes {
		return nil, errors.New("file too large (max 10MB)")
	}

	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		ext = ".bin"
	}
	mime := detectMime(data, ext)
	now := time.Now().UTC()
	prefix := now.Format("2006/01")
	key := fmt.Sprintf("%s/%s%s", prefix, util.RandomString(16), ext)

	media := &model.Media{
		Filename: filename,
		Mime:     mime,
		Size:     int64(len(data)),
	}

	img, format, err := decodeImage(data)
	if err == nil {
		// Compress large images.
		if img.Bounds().Dx() > maxImageWidth {
			img = imaging.Resize(img, maxImageWidth, 0, imaging.Lanczos)
		}
		var buf bytes.Buffer
		if err := imaging.Encode(&buf, img, format, imaging.JPEGQuality(85)); err != nil {
			return nil, err
		}
		media.Width = img.Bounds().Dx()
		media.Height = img.Bounds().Dy()
		media.Size = int64(buf.Len())

		url, err := s.storage.Save(ctx, key, buf.Bytes())
		if err != nil {
			return nil, err
		}
		media.Key = key
		media.URL = url

		// Generate thumbnail.
		thumb := imaging.Resize(img, thumbMaxWidth, 0, imaging.Lanczos)
		var tbuf bytes.Buffer
		if err := imaging.Encode(&tbuf, thumb, format, imaging.JPEGQuality(80)); err == nil {
			thumbKey := fmt.Sprintf("%s/thumb_%s%s", prefix, util.RandomString(12), ext)
			if thumbURL, err := s.storage.Save(ctx, thumbKey, tbuf.Bytes()); err == nil {
				media.ThumbURL = thumbURL
			}
		}
	} else {
		url, err := s.storage.Save(ctx, key, data)
		if err != nil {
			return nil, err
		}
		media.Key = key
		media.URL = url
	}

	if err := s.repo.Create(media); err != nil {
		return nil, err
	}
	return media, nil
}

// List returns paginated media.
func (s *MediaService) List(page, size int) ([]model.Media, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	return s.repo.List(page, size)
}

// Delete removes a media record and its stored files.
func (s *MediaService) Delete(ctx context.Context, id uint) error {
	m, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	if m.Key != "" {
		_ = s.storage.Delete(ctx, m.Key)
	}
	return s.repo.Delete(m)
}

func decodeImage(data []byte) (image.Image, imaging.Format, error) {
	img, format, err := image.Decode(bytes.NewReader(data))
	if err != nil {
		return nil, 0, err
	}
	switch format {
	case "jpeg":
		return img, imaging.JPEG, nil
	case "png":
		return img, imaging.PNG, nil
	case "gif":
		return img, imaging.GIF, nil
	default:
		return img, imaging.JPEG, nil
	}
}

func detectMime(data []byte, ext string) string {
	n := len(data)
	if n > 512 {
		n = 512
	}
	sniff := strings.ToLower(string(data[:n]))
	switch {
	case strings.Contains(sniff, "<svg"):
		return "image/svg+xml"
	case strings.HasPrefix(sniff, "\xff\xd8\xff"):
		return "image/jpeg"
	case strings.HasPrefix(sniff, "\x89png"):
		return "image/png"
	case strings.HasPrefix(sniff, "gif8"):
		return "image/gif"
	case strings.Contains(sniff, "webp"):
		return "image/webp"
	}
	switch ext {
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".png":
		return "image/png"
	case ".gif":
		return "image/gif"
	case ".webp":
		return "image/webp"
	case ".svg":
		return "image/svg+xml"
	case ".pdf":
		return "application/pdf"
	}
	return "application/octet-stream"
}
