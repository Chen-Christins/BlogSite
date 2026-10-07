package util

import (
	"bytes"
	"regexp"
	"strings"
	"unicode"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
)

var md = goldmark.New(
	goldmark.WithExtensions(
		extension.GFM,
		extension.Typographer,
		extension.Table,
		extension.Strikethrough,
		extension.Linkify,
		extension.TaskList,
	),
	goldmark.WithParserOptions(
		parser.WithAutoHeadingID(),
	),
	goldmark.WithRendererOptions(
		html.WithUnsafe(),
		html.WithHardWraps(),
	),
)

// RenderMarkdown converts markdown source into HTML.
func RenderMarkdown(source string) (string, error) {
	var buf bytes.Buffer
	if err := md.Convert([]byte(source), &buf); err != nil {
		return "", err
	}
	return buf.String(), nil
}

var htmlTagRe = regexp.MustCompile(`<[^>]*>`)

// PlainText strips HTML tags and collapses whitespace.
func PlainText(html string) string {
	return strings.TrimSpace(htmlTagRe.ReplaceAllString(html, " "))
}

// ReadingTime estimates reading minutes. CJK characters count as one word.
func ReadingTime(content string) int {
	text := PlainText(content)
	var cjk, words, inWord int
	for _, r := range text {
		switch {
		case unicode.Is(unicode.Han, r) || unicode.Is(unicode.Hiragana, r) || unicode.Is(unicode.Katakana, r) || unicode.Is(unicode.Hangul, r):
			cjk++
			inWord = 0
		case unicode.IsSpace(r):
			inWord = 0
		default:
			if inWord == 0 {
				words++
				inWord = 1
			}
		}
	}
	total := cjk + words
	minutes := total / 300
	if minutes < 1 {
		return 1
	}
	return minutes
}

// Excerpt returns a plain-text summary limited to max runes.
func Excerpt(content string, max int) string {
	text := PlainText(content)
	runes := []rune(text)
	if len(runes) <= max {
		return text
	}
	return strings.TrimSpace(string(runes[:max])) + "..."
}
