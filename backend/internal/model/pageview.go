package model

// PageView aggregates daily view counts per post.
type PageView struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	PostID uint   `gorm:"index;not null" json:"post_id"`
	Date   string `gorm:"size:10;not null" json:"date"` // YYYY-MM-DD
	Count  int64  `gorm:"default:0" json:"count"`
}
