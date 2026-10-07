package config

import (
	"strconv"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	App      AppConfig      `mapstructure:"app"`
	Server   ServerConfig   `mapstructure:"server"`
	Database DatabaseConfig `mapstructure:"database"`
	JWT      JWTConfig      `mapstructure:"jwt"`
	Admin    AdminConfig    `mapstructure:"admin"`
	Storage  StorageConfig  `mapstructure:"storage"`
	Comment  CommentConfig  `mapstructure:"comment"`
}

type AppConfig struct {
	Name    string `mapstructure:"name"`
	BaseURL string `mapstructure:"base_url"`
	Env     string `mapstructure:"env"`
}

type ServerConfig struct {
	Port int    `mapstructure:"port"`
	Mode string `mapstructure:"mode"`
}

type DatabaseConfig struct {
	Host        string `mapstructure:"host"`
	Port        int    `mapstructure:"port"`
	User        string `mapstructure:"user"`
	Password    string `mapstructure:"password"`
	Name        string `mapstructure:"name"`
	SSLMode     string `mapstructure:"ssl_mode"`
	AutoMigrate bool   `mapstructure:"auto_migrate"`
	Timezone    string `mapstructure:"timezone"`
}

type JWTConfig struct {
	Secret string `mapstructure:"secret"`
	Issuer string `mapstructure:"issuer"`
	Expire int    `mapstructure:"expire_hours"`
}

type AdminConfig struct {
	Username     string `mapstructure:"username"`
	Password     string `mapstructure:"password"`
	PasswordHash string `mapstructure:"password_hash"`
}

type StorageConfig struct {
	Driver string          `mapstructure:"driver"`
	Local  LocalStorageCfg `mapstructure:"local"`
	S3     S3StorageCfg    `mapstructure:"s3"`
}

type LocalStorageCfg struct {
	Dir     string `mapstructure:"dir"`
	BaseURL string `mapstructure:"base_url"`
}

type S3StorageCfg struct {
	Endpoint        string `mapstructure:"endpoint"`
	Region          string `mapstructure:"region"`
	Bucket          string `mapstructure:"bucket"`
	AccessKeyID     string `mapstructure:"access_key_id"`
	SecretAccessKey string `mapstructure:"secret_access_key"`
	UseSSL          bool   `mapstructure:"use_ssl"`
	PublicBaseURL   string `mapstructure:"public_base_url"`
}

type CommentConfig struct {
	AutoApprove     bool     `mapstructure:"auto_approve"`
	RateLimitPerMin int      `mapstructure:"rate_limit_per_min"`
	Blacklist       []string `mapstructure:"blacklist"`
}

// Load reads configuration from file and environment variables.
func Load(path string) (*Config, error) {
	v := viper.New()

	v.SetDefault("app.name", "Blog")
	v.SetDefault("app.base_url", "http://localhost:8080")
	v.SetDefault("app.env", "development")

	v.SetDefault("server.port", 8080)
	v.SetDefault("server.mode", "debug")

	v.SetDefault("database.host", "localhost")
	v.SetDefault("database.port", 5432)
	v.SetDefault("database.user", "postgres")
	v.SetDefault("database.password", "postgres")
	v.SetDefault("database.name", "blogsite")
	v.SetDefault("database.ssl_mode", "disable")
	v.SetDefault("database.auto_migrate", true)
	v.SetDefault("database.timezone", "Asia/Shanghai")

	v.SetDefault("jwt.secret", "change-me-in-production")
	v.SetDefault("jwt.issuer", "blogsite")
	v.SetDefault("jwt.expire_hours", 72)

	v.SetDefault("admin.username", "admin")
	v.SetDefault("admin.password", "")
	v.SetDefault("admin.password_hash", "")

	v.SetDefault("storage.driver", "local")
	v.SetDefault("storage.local.dir", "./uploads")
	v.SetDefault("storage.local.base_url", "/uploads")

	v.SetDefault("comment.auto_approve", false)
	v.SetDefault("comment.rate_limit_per_min", 5)
	v.SetDefault("comment.blacklist", []string{})

	if path != "" {
		v.SetConfigFile(path)
	} else {
		v.SetConfigName("config")
		v.SetConfigType("yaml")
		v.AddConfigPath(".")
		v.AddConfigPath("./config")
	}

	v.SetEnvPrefix("BLOG")
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		if _, ok := err.(viper.ConfigFileNotFoundError); !ok && path != "" {
			return nil, err
		}
	}

	var cfg Config
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, err
	}
	return &cfg, nil
}

// DSN builds the PostgreSQL connection string.
func (d DatabaseConfig) DSN() string {
	tz := d.Timezone
	if tz == "" {
		tz = "UTC"
	}
	return "host=" + d.Host +
		" port=" + strconv.Itoa(d.Port) +
		" user=" + d.User +
		" password=" + d.Password +
		" dbname=" + d.Name +
		" sslmode=" + d.SSLMode +
		" TimeZone=" + tz
}
