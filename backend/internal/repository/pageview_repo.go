package repository

import (
	"time"

	"blogsite/backend/internal/model"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

// PageViewRepository provides data access for daily view statistics.
type PageViewRepository struct {
	db *gorm.DB
}

// NewPageViewRepository creates a PageViewRepository.
func NewPageViewRepository(db *gorm.DB) *PageViewRepository {
	return &PageViewRepository{db: db}
}

// Upsert increments the daily counter for a post.
func (r *PageViewRepository) Upsert(postID uint, date string) error {
	pv := model.PageView{PostID: postID, Date: date, Count: 1}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "post_id"}, {Name: "date"}},
		DoUpdates: clause.Assignments(map[string]interface{}{"count": gorm.Expr("page_views.count + 1")}),
	}).Create(&pv).Error
}

// TotalViews returns the sum of all recorded views.
func (r *PageViewRepository) TotalViews() (int64, error) {
	var total int64
	err := r.db.Model(&model.PageView{}).Select("COALESCE(SUM(count),0)").Scan(&total).Error
	return total, err
}

// DailyPoint is a single day in a trend series.
type DailyPoint struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

// Trend returns daily view totals for the last n days (oldest first), filling gaps.
func (r *PageViewRepository) Trend(days int) ([]DailyPoint, error) {
	since := time.Now().UTC().AddDate(0, 0, -(days - 1)).Format("2006-01-02")
	var rows []DailyPoint
	err := r.db.Model(&model.PageView{}).
		Select("date, COALESCE(SUM(count),0) as count").
		Where("date >= ?", since).
		Group("date").Order("date ASC").Scan(&rows).Error
	if err != nil {
		return nil, err
	}

	have := make(map[string]int64, len(rows))
	for _, r := range rows {
		have[r.Date] = r.Count
	}
	result := make([]DailyPoint, 0, days)
	for i := days - 1; i >= 0; i-- {
		d := time.Now().UTC().AddDate(0, 0, -i).Format("2006-01-02")
		result = append(result, DailyPoint{Date: d, Count: have[d]})
	}
	return result, nil
}
