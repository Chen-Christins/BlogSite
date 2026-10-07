import client, { unwrap } from './client'
import type {
  Category,
  Comment,
  CommentInput,
  CommentStatus,
  LoginResult,
  Media,
  Overview,
  PageResult,
  Post,
  PostInput,
  Settings,
  Tag,
} from './types'

// ---------- Public ----------

export const publicApi = {
  posts(params: {
    page?: number
    size?: number
    category?: string
    tag?: string
    q?: string
  }) {
    return unwrap<PageResult<Post>>(client.get('/posts', { params }))
  },
  post(slug: string) {
    return unwrap<Post>(client.get(`/posts/${slug}`))
  },
  search(q: string, page = 1, size = 10) {
    return unwrap<PageResult<Post>>(client.get('/search', { params: { q, page, size } }))
  },
  categories() {
    return unwrap<Category[]>(client.get('/categories'))
  },
  tags() {
    return unwrap<Tag[]>(client.get('/tags'))
  },
  comments(postId: number) {
    return unwrap<Comment[]>(client.get('/comments', { params: { post_id: postId } }))
  },
  createComment(input: CommentInput) {
    return unwrap<{ id: number; status: CommentStatus; message: string }>(
      client.post('/comments', input),
    )
  },
  settings() {
    return unwrap<Settings>(client.get('/settings'))
  },
}

// ---------- Auth ----------

export const authApi = {
  login(username: string, password: string) {
    return unwrap<LoginResult>(client.post('/admin/login', { username, password }))
  },
  me() {
    return unwrap<{ username: string }>(client.get('/admin/me'))
  },
}

// ---------- Admin: posts ----------

export const adminPostApi = {
  list(params: { page?: number; size?: number; status?: string; q?: string }) {
    return unwrap<PageResult<Post>>(client.get('/admin/posts', { params }))
  },
  get(id: number) {
    return unwrap<Post>(client.get(`/admin/posts/${id}`))
  },
  create(input: PostInput) {
    return unwrap<Post>(client.post('/admin/posts', input))
  },
  update(id: number, input: PostInput) {
    return unwrap<Post>(client.put(`/admin/posts/${id}`, input))
  },
  remove(id: number) {
    return unwrap<{ deleted: boolean }>(client.delete(`/admin/posts/${id}`))
  },
  publish(id: number) {
    return unwrap<Post>(client.post(`/admin/posts/${id}/publish`))
  },
  unpublish(id: number) {
    return unwrap<Post>(client.post(`/admin/posts/${id}/unpublish`))
  },
}

// ---------- Admin: taxonomy ----------

export const adminCategoryApi = {
  create(input: Partial<Category>) {
    return unwrap<Category>(client.post('/admin/categories', input))
  },
  update(id: number, input: Partial<Category>) {
    return unwrap<Category>(client.put(`/admin/categories/${id}`, input))
  },
  remove(id: number) {
    return unwrap<{ deleted: boolean }>(client.delete(`/admin/categories/${id}`))
  },
}

export const adminTagApi = {
  create(input: Partial<Tag>) {
    return unwrap<Tag>(client.post('/admin/tags', input))
  },
  update(id: number, input: Partial<Tag>) {
    return unwrap<Tag>(client.put(`/admin/tags/${id}`, input))
  },
  remove(id: number) {
    return unwrap<{ deleted: boolean }>(client.delete(`/admin/tags/${id}`))
  },
}

// ---------- Admin: comments ----------

export const adminCommentApi = {
  list(params: { page?: number; size?: number; status?: string }) {
    return unwrap<PageResult<Comment>>(client.get('/admin/comments', { params }))
  },
  setStatus(id: number, status: CommentStatus) {
    return unwrap<{ updated: boolean }>(client.put(`/admin/comments/${id}/status`, { status }))
  },
  remove(id: number) {
    return unwrap<{ deleted: boolean }>(client.delete(`/admin/comments/${id}`))
  },
}

// ---------- Admin: media ----------

export const adminMediaApi = {
  list(params: { page?: number; size?: number }) {
    return unwrap<PageResult<Media>>(client.get('/admin/media', { params }))
  },
  upload(file: File, onProgress?: (percent: number) => void) {
    const form = new FormData()
    form.append('file', file)
    return unwrap<Media>(
      client.post('/admin/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          if (onProgress && e.total) {
            onProgress(Math.round((e.loaded / e.total) * 100))
          }
        },
      }),
    )
  },
  remove(id: number) {
    return unwrap<{ deleted: boolean }>(client.delete(`/admin/media/${id}`))
  },
}

// ---------- Admin: stats & settings ----------

export const adminStatsApi = {
  overview() {
    return unwrap<Overview>(client.get('/admin/stats/overview'))
  },
}

export const adminSettingApi = {
  update(values: Settings) {
    return unwrap<Settings>(client.put('/admin/settings', values))
  },
}
