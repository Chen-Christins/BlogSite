package repository

import (
	"time"

	"blogsite/backend/internal/model"

	"gorm.io/gorm"
)

// PostFilter holds query options for listing posts.
type PostFilter struct {
	Status       string
	CategorySlug string
	TagSlug      string
	Query        string
	Page         int
	Size         int
}

// PostRepository provides data access for posts.
type PostRepository struct {
	db *gorm.DB
}

// NewPostRepository creates a new PostRepository.
func NewPostRepository(db *gorm.DB) *PostRepository {
	return &PostRepository{db: db}
}

func (r *PostRepository) base() *gorm.DB {
	return r.db.Model(&model.Post{})
}

// Create inserts a post.
func (r *PostRepository) Create(post *model.Post) error {
	return r.db.Create(post).Error
}

// Update saves a post and replaces its tags.
func (r *PostRepository) Update(post *model.Post) error {
	if err := r.db.Omit("Tags").Save(post).Error; err != nil {
		return err
	}
	return r.db.Model(post).Association("Tags").Replace(post.Tags)
}

// Delete removes a post (and its associations).
func (r *PostRepository) Delete(post *model.Post) error {
	if err := r.db.Model(post).Association("Tags").Clear(); err != nil {
		return err
	}
	return r.db.Delete(post).Error
}

// GetByID fetches a post with category and tags preloaded.
func (r *PostRepository) GetByID(id uint) (*model.Post, error) {
	var p model.Post
	err := r.db.Preload("Category").Preload("Tags").First(&p, id).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// GetBySlug fetches a post regardless of status.
func (r *PostRepository) GetBySlug(slug string) (*model.Post, error) {
	var p model.Post
	err := r.db.Preload("Category").Preload("Tags").
		Where("slug = ?", slug).First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// GetPublishedBySlug fetches a published post only.
func (r *PostRepository) GetPublishedBySlug(slug string) (*model.Post, error) {
	var p model.Post
	err := r.db.Preload("Category").Preload("Tags").
		Where("slug = ? AND status = ?", slug, model.PostStatusPublished).
		First(&p).Error
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// SlugExists reports whether a slug is already used (optionally excluding an id).
func (r *PostRepository) SlugExists(slug string, excludeID uint) (bool, error) {
	q := r.base().Where("slug = ?", slug)
	if excludeID > 0 {
		q = q.Where("id <> ?", excludeID)
	}
	var count int64
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// List returns posts matching the filter plus the total count.
func (r *PostRepository) List(f PostFilter) ([]model.Post, int64, error) {
	countQ := r.applyFilters(r.base(), f)
	var total int64
	if err := countQ.Distinct("posts.id").Count(&total).Error; err != nil {
		return nil, 0, err
	}

	listQ := r.applyFilters(r.base(), f)
	if f.TagSlug != "" {
		listQ = listQ.Group("posts.id")
	}

	var posts []model.Post
	err := listQ.Preload("Category").Preload("Tags").
		Order("posts.published_at DESC NULLS LAST, posts.created_at DESC").
		Limit(f.Size).Offset((f.Page - 1) * f.Size).
		Find(&posts).Error
	if err != nil {
		return nil, 0, err
	}
	return posts, total, nil
}

func (r *PostRepository) applyFilters(q *gorm.DB, f PostFilter) *gorm.DB {
	if f.Status != "" {
		q = q.Where("posts.status = ?", f.Status)
	}
	if f.CategorySlug != "" {
		q = q.Joins("JOIN categories ON categories.id = posts.category_id").
			Where("categories.slug = ?", f.CategorySlug)
	}
	if f.TagSlug != "" {
		q = q.Joins("JOIN post_tags ON post_tags.post_id = posts.id").
			Joins("JOIN tags ON tags.id = post_tags.tag_id").
			Where("tags.slug = ?", f.TagSlug)
	}
	if f.Query != "" {
		q = q.Where("posts.search_vector @@ plainto_tsquery('simple', ?)", f.Query)
	}
	return q
}

// IncrementView bumps the view counter of a post.
func (r *PostRepository) IncrementView(id uint) error {
	return r.base().Where("id = ?", id).
		UpdateColumn("view_count", gorm.Expr("view_count + 1")).Error
}

// TopByViews returns the most viewed published posts.
func (r *PostRepository) TopByViews(limit int) ([]model.Post, error) {
	var posts []model.Post
	err := r.base().Where("status = ?", model.PostStatusPublished).
		Order("view_count DESC").Limit(limit).Find(&posts).Error
	return posts, err
}

// Count returns the number of posts with the given optional status.
func (r *PostRepository) Count(status string) (int64, error) {
	q := r.base()
	if status != "" {
		q = q.Where("status = ?", status)
	}
	var count int64
	err := q.Count(&count).Error
	return count, err
}

// CountCreatedSince returns posts created on or after t.
func (r *PostRepository) CountCreatedSince(t time.Time) (int64, error) {
	var count int64
	err := r.base().Where("created_at >= ?", t).Count(&count).Error
	return count, err
}
