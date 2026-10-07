package service

import (
	"errors"
	"strings"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
)

// CommentInput is the payload for submitting a comment.
type CommentInput struct {
	PostID     uint   `json:"post_id"`
	ParentID   *uint  `json:"parent_id"`
	AuthorName string `json:"author_name"`
	Email      string `json:"email"`
	Website    string `json:"website"`
	Content    string `json:"content"`
	Honeypot   string `json:"honeypot"`
}

// CommentService implements comment business logic.
type CommentService struct {
	repo *repository.CommentRepository
	cfg  config.CommentConfig
}

// NewCommentService creates a CommentService.
func NewCommentService(repo *repository.CommentRepository, cfg config.CommentConfig) *CommentService {
	return &CommentService{repo: repo, cfg: cfg}
}

// Create validates and stores a new comment.
func (s *CommentService) Create(in CommentInput, ip, ua string) (*model.Comment, error) {
	if strings.TrimSpace(in.Content) == "" {
		return nil, errors.New("content is required")
	}
	if strings.TrimSpace(in.AuthorName) == "" {
		return nil, errors.New("author_name is required")
	}
	if len([]rune(in.Content)) > 2000 {
		return nil, errors.New("content too long")
	}
	// Honeypot: bots fill hidden field; silently drop as spam.
	status := model.CommentStatusPending
	if in.Honeypot != "" {
		status = model.CommentStatusSpam
	} else if s.cfg.AutoApprove {
		status = model.CommentStatusApproved
	}
	if s.matchesBlacklist(in.Content) {
		status = model.CommentStatusSpam
	}

	c := &model.Comment{
		PostID:     in.PostID,
		ParentID:   in.ParentID,
		AuthorName: in.AuthorName,
		Email:      in.Email,
		Website:    in.Website,
		Content:    in.Content,
		Status:     status,
		IP:         ip,
		UserAgent:  ua,
	}
	if err := s.repo.Create(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *CommentService) matchesBlacklist(content string) bool {
	lower := strings.ToLower(content)
	for _, w := range s.cfg.Blacklist {
		if w == "" {
			continue
		}
		if strings.Contains(lower, strings.ToLower(w)) {
			return true
		}
	}
	return false
}

// ListApprovedTree returns approved comments for a post as a nested tree.
func (s *CommentService) ListApprovedTree(postID uint) ([]*model.Comment, error) {
	list, err := s.repo.ListApprovedByPost(postID)
	if err != nil {
		return nil, err
	}
	return buildTree(list), nil
}

// ListAll returns paginated comments for admin.
func (s *CommentService) ListAll(status string, page, size int) ([]model.Comment, int64, error) {
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 100 {
		size = 20
	}
	return s.repo.List(status, page, size)
}

// UpdateStatus changes a comment's moderation status.
func (s *CommentService) UpdateStatus(id uint, status string) error {
	switch status {
	case model.CommentStatusPending, model.CommentStatusApproved, model.CommentStatusSpam:
	default:
		return errors.New("invalid status")
	}
	return s.repo.UpdateStatus(id, status)
}

// Delete removes a comment.
func (s *CommentService) Delete(id uint) error {
	c, err := s.repo.GetByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(c)
}

func buildTree(flat []model.Comment) []*model.Comment {
	byID := make(map[uint]*model.Comment, len(flat))
	for i := range flat {
		c := flat[i]
		c.Replies = nil
		byID[c.ID] = &c
	}
	var roots []*model.Comment
	for i := range flat {
		c := flat[i]
		node := byID[c.ID]
		if c.ParentID != nil {
			if parent, ok := byID[*c.ParentID]; ok {
				parent.Replies = append(parent.Replies, node)
				continue
			}
		}
		roots = append(roots, node)
	}
	return roots
}
