package service

import "blogsite/backend/internal/repository"

// SettingService provides site settings access.
type SettingService struct {
	repo *repository.SettingRepository
}

// NewSettingService creates a SettingService.
func NewSettingService(repo *repository.SettingRepository) *SettingService {
	return &SettingService{repo: repo}
}

// All returns all settings.
func (s *SettingService) All() (map[string]string, error) {
	return s.repo.All()
}

// SetMany upserts the provided settings.
func (s *SettingService) SetMany(values map[string]string) error {
	return s.repo.SetMany(values)
}
