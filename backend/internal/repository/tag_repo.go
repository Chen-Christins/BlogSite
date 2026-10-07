package repository

import (
	"blogsite/backend/internal/model"
	"blogsite/backend/internal/util"

	"gorm.io/gorm"
)

// TagRepository provides data access for tags.
type TagRepository struct {
	db *gorm.DB
}

// NewTagRepository creates a TagRepository.
func NewTagRepository(db *gorm.DB) *TagRepository {
	return &TagRepository{db: db}
}

// Create inserts a tag.
func (r *TagRepository) Create(t *model.Tag) error {
	return r.db.Create(t).Error
}

// Update saves a tag.
func (r *TagRepository) Update(t *model.Tag) error {
	return r.db.Save(t).Error
}

// Delete removes a tag.
func (r *TagRepository) Delete(t *model.Tag) error {
	return r.db.Delete(t).Error
}

// GetByID fetches a tag by id.
func (r *TagRepository) GetByID(id uint) (*model.Tag, error) {
	var t model.Tag
	if err := r.db.First(&t, id).Error; err != nil {
		return nil, err
	}
	return &t, nil
}

// FindOrCreate returns existing tags for the given names, creating missing ones.
func (r *TagRepository) FindOrCreate(names []string) ([]model.Tag, error) {
	var result []model.Tag
	for _, name := range names {
		var t model.Tag
		err := r.db.Where("name = ?", name).First(&t).Error
		if err == nil {
			result = append(result, t)
			continue
		}
		if err != gorm.ErrRecordNotFound {
			return nil, err
		}
		result = append(result, model.Tag{Name: name, Slug: util.Slugify(name)})
	}
	return result, nil
}

// List returns tags with their published post counts.
func (r *TagRepository) List() ([]TagWithCount, error) {
	var list []TagWithCount
	err := r.db.Model(&model.Tag{}).
		Select("tags.id, tags.name, tags.slug, count(post_tags.post_id) as post_count").
		Joins("LEFT JOIN post_tags ON post_tags.tag_id = tags.id").
		Group("tags.id, tags.name, tags.slug").
		Order("post_count DESC, tags.id ASC").
		Scan(&list).Error
	return list, err
}

// TagWithCount is a tag along with the number of associated posts.
type TagWithCount struct {
	ID        uint   `json:"id"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	PostCount int64  `json:"post_count"`
}

// SlugExists reports whether a slug is used by another tag.
func (r *TagRepository) SlugExists(slug string, excludeID uint) (bool, error) {
	q := r.db.Model(&model.Tag{}).Where("slug = ?", slug)
	if excludeID > 0 {
		q = q.Where("id <> ?", excludeID)
	}
	var count int64
	err := q.Count(&count).Error
	return count > 0, err
}
