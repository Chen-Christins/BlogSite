package model

import "time"

// Post status values.
const (
	PostStatusDraft     = "draft"
	PostStatusPublished = "published"
)

// Post represents a blog article.
type Post struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Title       string     `gorm:"size:255;not null" json:"title"`
	Slug        string     `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Summary     string     `gorm:"type:text" json:"summary"`
	ContentMD   string     `gorm:"type:text" json:"content_md"`
	ContentHTML string     `gorm:"type:text" json:"content_html"`
	CoverImage  string     `gorm:"size:512" json:"cover_image"`
	CategoryID  *uint      `json:"category_id"`
	Category    *Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Tags        []Tag      `gorm:"many2many:post_tags;" json:"tags"`
	Status      string     `gorm:"size:20;index;default:draft" json:"status"`
	PublishedAt *time.Time `json:"published_at"`
	ViewCount   int64      `gorm:"default:0" json:"view_count"`
	ReadingTime int        `gorm:"default:0" json:"reading_time"`

	SearchVector string `gorm:"type:tsvector" json:"-"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// PostTag is the join table between posts and tags.
type PostTag struct {
	PostID uint `gorm:"primaryKey" json:"post_id"`
	TagID  uint `gorm:"primaryKey" json:"tag_id"`
}
