package repository

import (
	"blogsite/backend/internal/model"

	"gorm.io/gorm"
)

// CommentRepository provides data access for comments.
type CommentRepository struct {
	db *gorm.DB
}

// NewCommentRepository creates a CommentRepository.
func NewCommentRepository(db *gorm.DB) *CommentRepository {
	return &CommentRepository{db: db}
}

// Create inserts a comment.
func (r *CommentRepository) Create(c *model.Comment) error {
	return r.db.Create(c).Error
}

// GetByID fetches a comment by id.
func (r *CommentRepository) GetByID(id uint) (*model.Comment, error) {
	var c model.Comment
	if err := r.db.First(&c, id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

// Delete removes a comment.
func (r *CommentRepository) Delete(c *model.Comment) error {
	return r.db.Delete(c).Error
}

// UpdateStatus sets the moderation status of a comment.
func (r *CommentRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&model.Comment{}).Where("id = ?", id).
		Update("status", status).Error
}

// ListApprovedByPost returns approved comments for a post.
func (r *CommentRepository) ListApprovedByPost(postID uint) ([]model.Comment, error) {
	var list []model.Comment
	err := r.db.Where("post_id = ? AND status = ?", postID, model.CommentStatusApproved).
		Order("created_at ASC").Find(&list).Error
	return list, err
}

// List returns comments filtered by status (empty for all) with pagination.
func (r *CommentRepository) List(status string, page, size int) ([]model.Comment, int64, error) {
	q := r.db.Model(&model.Comment{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var total int64
	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}
	var list []model.Comment
	err := q.Order("created_at DESC").Limit(size).Offset((page - 1) * size).
		Find(&list).Error
	return list, total, err
}

// Count returns the number of comments with the given optional status.
func (r *CommentRepository) Count(status string) (int64, error) {
	q := r.db.Model(&model.Comment{})
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var count int64
	err := q.Count(&count).Error
	return count, err
}
