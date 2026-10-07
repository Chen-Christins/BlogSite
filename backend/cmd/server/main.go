package main

import (
	"context"
	"errors"
	"flag"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"blogsite/backend/internal/config"
	"blogsite/backend/internal/database"
	"blogsite/backend/internal/handler"
	"blogsite/backend/internal/logger"
	"blogsite/backend/internal/repository"
	"blogsite/backend/internal/router"
	"blogsite/backend/internal/service"
	"blogsite/backend/internal/storage"

	"github.com/rs/zerolog/log"
)

func main() {
	configPath := flag.String("config", "", "path to config file")
	flag.Parse()

	cfg, err := config.Load(*configPath)
	if err != nil {
		log.Fatal().Err(err).Msg("load config")
	}

	logger.Init(cfg.App.Env)

	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("connect database")
	}

	if cfg.Database.AutoMigrate {
		if err := database.Migrate(db); err != nil {
			log.Fatal().Err(err).Msg("migrate database")
		}
	}
	if err := database.Seed(db); err != nil {
		log.Fatal().Err(err).Msg("seed database")
	}

	st, err := storage.NewStorage(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("init storage")
	}

	// Repositories
	postRepo := repository.NewPostRepository(db)
	categoryRepo := repository.NewCategoryRepository(db)
	tagRepo := repository.NewTagRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	mediaRepo := repository.NewMediaRepository(db)
	viewRepo := repository.NewPageViewRepository(db)
	settingRepo := repository.NewSettingRepository(db)

	// Services
	authService, err := service.NewAuthService(cfg)
	if err != nil {
		log.Fatal().Err(err).Msg("init auth service")
	}
	postService := service.NewPostService(postRepo, tagRepo, categoryRepo, viewRepo)
	categoryService := service.NewCategoryService(categoryRepo)
	tagService := service.NewTagService(tagRepo)
	commentService := service.NewCommentService(commentRepo, cfg.Comment)
	mediaService := service.NewMediaService(mediaRepo, st)
	statsService := service.NewStatsService(postRepo, commentRepo, viewRepo, mediaRepo)
	settingService := service.NewSettingService(settingRepo)

	api := handler.New(
		cfg,
		authService,
		postService,
		categoryService,
		tagService,
		commentService,
		mediaService,
		statsService,
		settingService,
		st,
	)

	engine := router.Setup(cfg, api)

	srv := &http.Server{
		Addr:    ":" + strconv.Itoa(cfg.Server.Port),
		Handler: engine,
	}

	go func() {
		log.Info().Str("addr", srv.Addr).Msg("server started")
		if err := srv.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Fatal().Err(err).Msg("server error")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down server")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error().Err(err).Msg("server forced to shutdown")
	}
	log.Info().Msg("server exited")
}
