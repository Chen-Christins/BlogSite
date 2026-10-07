package database

import (
	"blogsite/backend/internal/model"

	"gorm.io/gorm"
)

// Seed inserts default site settings when missing.
func Seed(db *gorm.DB) error {
	defaults := map[string]string{
		"site_title":       "My Blog",
		"site_subtitle":    "Thoughts and notes",
		"site_description": "A personal blog built with React and Go.",
		"site_keywords":    "blog,go,react",
		"footer_text":      "Powered by Go & React",
		"icp":              "",
	}
	for k, v := range defaults {
		var count int64
		if err := db.Model(&model.Setting{}).Where("key = ?", k).Count(&count).Error; err != nil {
			return err
		}
		if count == 0 {
			if err := db.Create(&model.Setting{Key: k, Value: v}).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
