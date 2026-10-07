package service

import (
	"errors"

	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
	"blogsite/backend/internal/util"
)

// TagService implements tag business logic.
type TagService struct {
	repo *repository.TagRepository
}

// NewTagService creates a TagService.
func NewTagService(repo *repository.TagRepository) *TagService {
	return &TagService{repo: repo}
}

// Create adds a tag.
func (s *TagService) Create(in model.Tag) (*model.Tag, error) {
	if in.Name == "" {
		return nil, errors.New("name is required")
	}
	if in.Slug == "" {
		in.Slug = util.Slugify(in.Name)
	} else {
		in.Slug = util.Slugify(in.Slug)
	}
	if in.Slug == "" {
		in.Slug = "tag-" + util.RandomString(6)
	}
	return &in, s.repo.Create(&in)
}

// Update modifies a tag.
func (s *TagService) Update(id uint, in model.Tag) (*model.Tag, error) {
	t, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if in.Name != "" {
		t.Name = in.Name
	}
	if in.Slug != "" {
		t.Slug = util.Slugify(in.Slug)
	}
	return t, s.repo.Update(t)
}

// Delete removes a tag.
func (s *TagService) Delete(id uint) error {
	t, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(t)
}

// List returns tags with post counts.
func (s *TagService) List() ([]repository.TagWithCount, error) {
	return s.repo.List()
}
