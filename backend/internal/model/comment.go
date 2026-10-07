package model

import "time"

// Comment status values.
const (
	CommentStatusPending  = "pending"
	CommentStatusApproved = "approved"
	CommentStatusSpam     = "spam"
)

// Comment represents a reader comment, supporting nested replies.
type Comment struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	PostID     uint   `gorm:"index;not null" json:"post_id"`
	ParentID   *uint  `gorm:"index" json:"parent_id"`
	AuthorName string `gorm:"size:100;not null" json:"author_name"`
	Email      string `gorm:"size:255" json:"email"`
	Website    string `gorm:"size:255" json:"website"`
	Content    string `gorm:"type:text;not null" json:"content"`
	Status     string `gorm:"size:20;index;default:pending" json:"status"`
	IP         string `gorm:"size:64" json:"-"`
	UserAgent  string `gorm:"size:512" json:"-"`

	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
	Replies   []*Comment `gorm:"-" json:"replies,omitempty"`
}
