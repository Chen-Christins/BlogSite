package model

import "time"

// Media stores metadata of uploaded files.
type Media struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Filename  string    `gorm:"size:255;not null" json:"filename"`
	Key       string    `gorm:"size:512;not null" json:"key"`
	URL       string    `gorm:"size:512;not null" json:"url"`
	ThumbURL  string    `gorm:"size:512" json:"thumb_url"`
	Mime      string    `gorm:"size:100" json:"mime"`
	Size      int64     `json:"size"`
	Width     int       `json:"width"`
	Height    int       `json:"height"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
