export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  sort: number
  post_count?: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  post_count?: number
  created_at: string
  updated_at: string
}

export type PostStatus = 'draft' | 'published'

export interface Post {
  id: number
  title: string
  slug: string
  summary: string
  content_md: string
  content_html: string
  cover_image: string
  category_id: number | null
  category?: Category | null
  tags: Tag[]
  status: PostStatus
  published_at: string | null
  view_count: number
  reading_time: number
  created_at: string
  updated_at: string
}

export interface PostInput {
  title: string
  slug?: string
  summary?: string
  content_md: string
  cover_image?: string
  category_id?: number | null
  tags?: string[]
  status?: PostStatus
}

export type CommentStatus = 'pending' | 'approved' | 'spam'

export interface Comment {
  id: number
  post_id: number
  parent_id: number | null
  author_name: string
  email: string
  website: string
  content: string
  status: CommentStatus
  created_at: string
  replies?: Comment[]
}

export interface CommentInput {
  post_id: number
  parent_id?: number | null
  author_name: string
  email?: string
  website?: string
  content: string
  honeypot?: string
}

export interface Media {
  id: number
  filename: string
  key: string
  url: string
  thumb_url: string
  mime: string
  size: number
  width: number
  height: number
  created_at: string
}

export interface DailyPoint {
  date: string
  count: number
}

export interface Overview {
  total_posts: number
  published_posts: number
  draft_posts: number
  total_comments: number
  pending_comments: number
  total_views: number
  total_media: number
  view_trend: DailyPoint[]
  top_posts: Post[]
}

export type Settings = Record<string, string>

export interface LoginResult {
  token: string
  expires_at: string
  username: string
}
