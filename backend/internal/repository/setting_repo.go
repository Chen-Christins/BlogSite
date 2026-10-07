package repository

import (
	"blogsite/backend/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// SettingRepository provides key/value site settings access.
type SettingRepository struct {
	db *gorm.DB
}

// NewSettingRepository creates a SettingRepository.
func NewSettingRepository(db *gorm.DB) *SettingRepository {
	return &SettingRepository{db: db}
}

// Get returns the value of a setting (empty when missing).
func (r *SettingRepository) Get(key string) (string, error) {
	var s model.Setting
	err := r.db.First(&s, "key = ?", key).Error
	if err == gorm.ErrRecordNotFound {
		return "", nil
	}
	if err != nil {
		return "", err
	}
	return s.Value, nil
}

// All returns every setting as a map.
func (r *SettingRepository) All() (map[string]string, error) {
	var list []model.Setting
	if err := r.db.Find(&list).Error; err != nil {
		return nil, err
	}
	m := make(map[string]string, len(list))
	for _, s := range list {
		m[s.Key] = s.Value
	}
	return m, nil
}

// Set upserts a single setting.
func (r *SettingRepository) Set(key, value string) error {
	s := model.Setting{Key: key, Value: value}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value"}),
	}).Create(&s).Error
}

// SetMany upserts multiple settings in one transaction.
func (r *SettingRepository) SetMany(values map[string]string) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		repo := &SettingRepository{db: tx}
		for k, v := range values {
			if err := repo.Set(k, v); err != nil {
				return err
			}
		}
		return nil
	})
}
