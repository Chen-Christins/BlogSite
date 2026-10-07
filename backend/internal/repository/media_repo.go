package repository

import (
	"blogsite/backend/internal/model"

	"gorm.io/gorm"
)

// MediaRepository provides data access for uploads.
type MediaRepository struct {
	db *gorm.DB
}

// NewMediaRepository creates a MediaRepository.
func NewMediaRepository(db *gorm.DB) *MediaRepository {
	return &MediaRepository{db: db}
}

// Create inserts a media record.
func (r *MediaRepository) Create(m *model.Media) error {
	return r.db.Create(m).Error
}

// GetByID fetches a media record.
func (r *MediaRepository) GetByID(id uint) (*model.Media, error) {
	var m model.Media
	if err := r.db.First(&m, id).Error; err != nil {
		return nil, err
	}
	return &m, nil
}

// Delete removes a media record.
func (r *MediaRepository) Delete(m *model.Media) error {
	return r.db.Delete(m).Error
}

// List returns media ordered by newest first with pagination.
func (r *MediaRepository) List(page, size int) ([]model.Media, int64, error) {
	var total int64
	if err := r.db.Model(&model.Media{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.Media
	err := r.db.Order("created_at DESC").Limit(size).Offset((page - 1) * size).
		Find(&list).Error
	return list, total, err
}
