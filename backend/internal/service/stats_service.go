package service

import (
	"blogsite/backend/internal/model"
	"blogsite/backend/internal/repository"
)

// StatsService aggregates dashboard statistics.
type StatsService struct {
	posts    *repository.PostRepository
	comments *repository.CommentRepository
	views    *repository.PageViewRepository
	media    *repository.MediaRepository
}

// NewStatsService creates a StatsService.
func NewStatsService(
	posts *repository.PostRepository,
	comments *repository.CommentRepository,
	views *repository.PageViewRepository,
	media *repository.MediaRepository,
) *StatsService {
	return &StatsService{posts: posts, comments: comments, views: views, media: media}
}

// Overview is the dashboard summary payload.
type Overview struct {
	TotalPosts     int64                   `json:"total_posts"`
	PublishedPosts int64                   `json:"published_posts"`
	DraftPosts     int64                   `json:"draft_posts"`
	TotalComments  int64                   `json:"total_comments"`
	PendingComment int64                   `json:"pending_comments"`
	TotalViews     int64                   `json:"total_views"`
	TotalMedia     int64                   `json:"total_media"`
	ViewTrend      []repository.DailyPoint `json:"view_trend"`
	TopPosts       []model.Post            `json:"top_posts"`
}

// GetOverview returns the dashboard summary.
func (s *StatsService) GetOverview() (*Overview, error) {
	o := &Overview{}
	var err error

	if o.TotalPosts, err = s.posts.Count(""); err != nil {
		return nil, err
	}
	if o.PublishedPosts, err = s.posts.Count(model.PostStatusPublished); err != nil {
		return nil, err
	}
	o.DraftPosts = o.TotalPosts - o.PublishedPosts

	if o.TotalComments, err = s.comments.Count(""); err != nil {
		return nil, err
	}
	if o.PendingComment, err = s.comments.Count(model.CommentStatusPending); err != nil {
		return nil, err
	}
	if o.TotalViews, err = s.views.TotalViews(); err != nil {
		return nil, err
	}
	if _, total, err := s.media.List(1, 1); err != nil {
		return nil, err
	} else {
		o.TotalMedia = total
	}
	if o.ViewTrend, err = s.views.Trend(30); err != nil {
		return nil, err
	}
	if o.TopPosts, err = s.posts.TopByViews(10); err != nil {
		return nil, err
	}
	return o, nil
}
