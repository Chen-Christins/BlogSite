package service

import (
	"errors"

	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
	"blogsite/backend/internal/util"
)

// CategoryService implements category business logic.
type CategoryService struct {
	repo *repository.CategoryRepository
}

// NewCategoryService creates a CategoryService.
func NewCategoryService(repo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{repo: repo}
}

// CategoryOutput is a category with its post count.
type CategoryOutput struct {
	model.Category
	PostCount int64 `json:"post_count"`
}

// Create adds a category.
func (s *CategoryService) Create(in model.Category) (*model.Category, error) {
	if in.Name == "" {
		return nil, errors.New("name is required")
	}
	if in.Slug == "" {
		in.Slug = util.Slugify(in.Name)
	} else {
		in.Slug = util.Slugify(in.Slug)
	}
	if in.Slug == "" {
		in.Slug = "category-" + util.RandomString(6)
	}
	return &in, s.repo.Create(&in)
}

// Update modifies a category.
func (s *CategoryService) Update(id uint, in model.Category) (*model.Category, error) {
	c, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if in.Name != "" {
		c.Name = in.Name
	}
	if in.Slug != "" {
		c.Slug = util.Slugify(in.Slug)
	}
	c.Description = in.Description
	c.Sort = in.Sort
	return c, s.repo.Update(c)
}

// Delete removes a category.
func (s *CategoryService) Delete(id uint) error {
	c, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(c)
}

// List returns categories with post counts.
func (s *CategoryService) List() ([]CategoryOutput, error) {
	list, err := s.repo.List()
	if err != nil {
		return nil, err
	}
	counts, err := s.repo.PostCountByCategory()
	if err != nil {
		return nil, err
	}
	out := make([]CategoryOutput, 0, len(list))
	for _, c := range list {
		out = append(out, CategoryOutput{Category: c, PostCount: counts[c.ID]})
	}
	return out, nil
}
