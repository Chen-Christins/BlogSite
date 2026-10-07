package repository

import (
	"blogsite/backend/internal/model"

	"gorm.io/gorm"
)

// CategoryRepository provides data access for categories.
type CategoryRepository struct {
	db *gorm.DB
}

// NewCategoryRepository creates a CategoryRepository.
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
	return &CategoryRepository{db: db}
}

// Create inserts a category.
func (r *CategoryRepository) Create(c *model.Category) error {
	return r.db.Create(c).Error
}

// Update saves a category.
func (r *CategoryRepository) Update(c *model.Category) error {
	return r.db.Save(c).Error
}

// Delete removes a category.
func (r *CategoryRepository) Delete(c *model.Category) error {
	return r.db.Delete(c).Error
}

// GetByID fetches a category by id.
func (r *CategoryRepository) GetByID(id uint) (*model.Category, error) {
	var c model.Category
	if err := r.db.First(&c, id).Error; err != nil {
		return nil, err
	}
	return &c, nil
}

// List returns all categories ordered by sort then id.
func (r *CategoryRepository) List() ([]model.Category, error) {
	var list []model.Category
	err := r.db.Order("sort ASC, id ASC").Find(&list).Error
	return list, err
}

// SlugExists reports whether a slug is used by another category.
func (r *CategoryRepository) SlugExists(slug string, excludeID uint) (bool, error) {
	q := r.db.Model(&model.Category{}).Where("slug = ?", slug)
	if excludeID > 0 {
		q = q.Where("id <> ?", excludeID)
	}
	var count int64
	err := q.Count(&count).Error
	return count > 0, err
}

// PostCountByCategory returns a map of category id to post count.
func (r *CategoryRepository) PostCountByCategory() (map[uint]int64, error) {
	type row struct {
		CategoryID uint
		Total      int64
	}
	var rows []row
	err := r.db.Model(&model.Post{}).
		Select("category_id, count(*) as total").
		Where("category_id IS NOT NULL").
		Group("category_id").Scan(&rows).Error
	if err != nil {
		return nil, err
	}
	m := make(map[uint]int64, len(rows))
	for _, r := range rows {
		m[r.CategoryID] = r.Total
	}
	return m, nil
}
