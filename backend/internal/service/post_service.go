package service

import (
	"errors"
	"fmt"
	"time"

	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
	"blogsite/backend/internal/util"

	"gorm.io/gorm"
)

// PostInput is the payload for creating or updating a post.
type PostInput struct {
	Title      string   `json:"title"`
	Slug       string   `json:"slug"`
	Summary    string   `json:"summary"`
	ContentMD  string   `json:"content_md"`
	CoverImage string   `json:"cover_image"`
	CategoryID *uint    `json:"category_id"`
	Tags       []string `json:"tags"`
	Status     string   `json:"status"`
}

// PostService implements post related business logic.
type PostService struct {
	posts *repository.PostRepository
	tags  *repository.TagRepository
	cats  *repository.CategoryRepository
	views *repository.PageViewRepository
}

// NewPostService creates a PostService.
func NewPostService(
	posts *repository.PostRepository,
	tags *repository.TagRepository,
	cats *repository.CategoryRepository,
	views *repository.PageViewRepository,
) *PostService {
	return &PostService{posts: posts, tags: tags, cats: cats, views: views}
}

func (s *PostService) render(p *model.Post, in PostInput) error {
	html, err := util.RenderMarkdown(in.ContentMD)
	if err != nil {
		return err
	}
	p.ContentHTML = html
	p.ReadingTime = util.ReadingTime(html)
	if p.Summary == "" {
		p.Summary = util.Excerpt(html, 160)
	}
	return nil
}

func (s *PostService) resolveSlug(desired, title string, excludeID uint) (string, error) {
	src := desired
	if src == "" {
		src = title
	}
	base := util.Slugify(src)
	if base == "" {
		base = "post-" + util.RandomString(8)
	}
	slug := base
	for i := 2; ; i++ {
		exists, err := s.posts.SlugExists(slug, excludeID)
		if err != nil {
			return "", err
		}
		if !exists {
			return slug, nil
		}
		slug = fmt.Sprintf("%s-%d", base, i)
	}
}

// Create creates a new post.
func (s *PostService) Create(in PostInput) (*model.Post, error) {
	if in.Title == "" {
		return nil, errors.New("title is required")
	}
	post := &model.Post{
		Title:      in.Title,
		Summary:    in.Summary,
		ContentMD:  in.ContentMD,
		CoverImage: in.CoverImage,
		CategoryID: in.CategoryID,
		Status:     model.PostStatusDraft,
	}
	slug, err := s.resolveSlug(in.Slug, in.Title, 0)
	if err != nil {
		return nil, err
	}
	post.Slug = slug
	if err := s.render(post, in); err != nil {
		return nil, err
	}
	tags, err := s.tags.FindOrCreate(in.Tags)
	if err != nil {
		return nil, err
	}
	post.Tags = tags

	if in.Status == model.PostStatusPublished {
		post.Status = model.PostStatusPublished
		now := time.Now().UTC()
		post.PublishedAt = &now
	}

	if err := s.posts.Create(post); err != nil {
		return nil, err
	}
	return s.posts.GetByID(post.ID)
}

// Update modifies an existing post.
func (s *PostService) Update(id uint, in PostInput) (*model.Post, error) {
	post, err := s.posts.GetByID(id)
	if err != nil {
		return nil, err
	}
	if in.Title != "" {
		post.Title = in.Title
	}
	post.Summary = ""
	post.ContentMD = in.ContentMD
	post.CoverImage = in.CoverImage
	post.CategoryID = in.CategoryID

	slug, err := s.resolveSlug(in.Slug, post.Title, post.ID)
	if err != nil {
		return nil, err
	}
	post.Slug = slug
	if err := s.render(post, in); err != nil {
		return nil, err
	}
	tags, err := s.tags.FindOrCreate(in.Tags)
	if err != nil {
		return nil, err
	}
	post.Tags = tags

	if err := s.posts.Update(post); err != nil {
		return nil, err
	}
	return s.posts.GetByID(post.ID)
}

// Publish marks a post as published.
func (s *PostService) Publish(id uint) (*model.Post, error) {
	post, err := s.posts.GetByID(id)
	if err != nil {
		return nil, err
	}
	post.Status = model.PostStatusPublished
	if post.PublishedAt == nil {
		now := time.Now().UTC()
		post.PublishedAt = &now
	}
	if err := s.posts.Update(post); err != nil {
		return nil, err
	}
	return post, nil
}

// Unpublish reverts a post to draft.
func (s *PostService) Unpublish(id uint) (*model.Post, error) {
	post, err := s.posts.GetByID(id)
	if err != nil {
		return nil, err
	}
	post.Status = model.PostStatusDraft
	if err := s.posts.Update(post); err != nil {
		return nil, err
	}
	return post, nil
}

// Delete removes a post.
func (s *PostService) Delete(id uint) error {
	post, err := s.posts.GetByID(id)
	if err != nil {
		return err
	}
	return s.posts.Delete(post)
}

// GetByID returns a post for admin.
func (s *PostService) GetByID(id uint) (*model.Post, error) {
	return s.posts.GetByID(id)
}

// GetPublishedBySlug returns a published post and records a view.
func (s *PostService) GetPublishedBySlug(slug string) (*model.Post, error) {
	post, err := s.posts.GetPublishedBySlug(slug)
	if err != nil {
		return nil, err
	}
	go s.recordView(post.ID)
	return post, nil
}

func (s *PostService) recordView(postID uint) {
	_ = s.posts.IncrementView(postID)
	_ = s.views.Upsert(postID, time.Now().UTC().Format("2006-01-02"))
}

// List returns paginated posts.
func (s *PostService) List(f repository.PostFilter) ([]model.Post, int64, error) {
	if f.Page < 1 {
		f.Page = 1
	}
	if f.Size < 1 || f.Size > 100 {
		f.Size = 10
	}
	return s.posts.List(f)
}

// IsNotFound reports whether an error is a gorm not-found error.
func IsNotFound(err error) bool {
	return errors.Is(err, gorm.ErrRecordNotFound)
}
