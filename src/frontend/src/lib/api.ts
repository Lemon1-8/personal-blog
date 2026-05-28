import { getAccessToken } from './auth'

// ─── Constants ───

const API_BASE = 'http://localhost:8000/api/v1'

// ─── Types ───

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface User {
  id: string
  username: string
  email: string
  nickname: string
  avatar: string
  bio?: string
  role: 'user' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  article_count: number
  order: number
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
  article_count: number
  created_at: string
}

export interface ArticleListItem {
  id: string
  title: string
  slug: string
  summary: string
  cover_image: string
  category: { id: string; name: string; slug: string }
  tags: { id: string; name: string; slug: string }[]
  author: { id: string; nickname: string; avatar: string }
  content?: string
  content_type?: string
  views_count: number
  likes_count: number
  comment_count: number
  is_pinned: boolean
  is_liked?: boolean
  is_favorited?: boolean
  published_at: string
  created_at: string
  updated_at: string
  prev_article?: { id: string; title: string; slug: string } | null
  next_article?: { id: string; title: string; slug: string } | null
}

export interface MediaItem {
  id: string
  url: string
  thumbnail_url: string
  large_url: string
  filename: string
  size: number
  width: number | null
  height: number | null
  mime_type: string
  created_at: string
}

export interface SiteSettings {
  site_name: string
  site_description: string
  site_logo: string
  favicon: string
  social_links: {
    github?: string
    twitter?: string
    weibo?: string
  }
  custom_footer?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}

export interface ArticleCreateRequest {
  title: string
  slug?: string
  summary?: string
  content: string
  content_type?: string
  cover_image?: string
  category_id?: string
  tag_ids?: string[]
  is_pinned?: boolean
  status?: string
}

// ─── Error Class ───

export class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.code = code
    this.name = 'ApiError'
  }
}

// ─── HTTP Helper ───

function authHeaders(): Record<string, string> {
  const token = getAccessToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return headers
}

async function request<T>(
  method: string,
  path: string,
  options?: {
    body?: unknown
    params?: Record<string, string | number | undefined>
    multipart?: boolean
  }
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}${path}`)

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  const headers: Record<string, string> = {
    ...authHeaders(),
  }

  let body: BodyInit | undefined

  if (options?.body !== undefined) {
    if (options.multipart) {
      body = options.body as FormData
    } else {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify(options.body)
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body,
  })

  const json: ApiResponse<T> = await response.json()

  if (json.code !== 0) {
    throw new ApiError(json.code, json.message)
  }

  return json
}

async function get<T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<ApiResponse<T>> {
  return request<T>('GET', path, { params })
}

async function post<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return request<T>('POST', path, { body })
}

async function put<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return request<T>('PUT', path, { body })
}

async function patch<T>(
  path: string,
  body?: unknown
): Promise<ApiResponse<T>> {
  return request<T>('PATCH', path, { body })
}

async function del<T>(
  path: string
): Promise<ApiResponse<T>> {
  return request<T>('DELETE', path)
}

async function upload<T>(
  path: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  return request<T>('POST', path, { body: formData, multipart: true })
}

// ─── Auth API ───

export async function login(data: LoginRequest): Promise<
  ApiResponse<{
    user: User
    access_token: string
    refresh_token: string
  }>
> {
  return post('/auth/login', data)
}

export async function register(
  data: RegisterRequest
): Promise<
  ApiResponse<{
    user: User
    access_token: string
    refresh_token: string
  }>
> {
  return post('/auth/register', data)
}

export async function getMe(): Promise<ApiResponse<User>> {
  return get('/auth/me')
}

export async function refreshToken(
  refresh_token: string
): Promise<
  ApiResponse<{
    access_token: string
    refresh_token: string
  }>
> {
  return post('/auth/refresh', { refresh_token })
}

export async function logout(
  refresh_token?: string
): Promise<ApiResponse<null>> {
  return post('/auth/logout', refresh_token ? { refresh_token } : undefined)
}

export async function updateProfile(data: {
  nickname?: string
  bio?: string
  avatar?: string
}): Promise<ApiResponse<User>> {
  return put('/auth/profile', data)
}

export async function changePassword(data: {
  old_password: string
  new_password: string
}): Promise<ApiResponse<null>> {
  return put('/auth/password', data)
}

// ─── Articles API ───

export async function getArticles(params?: {
  page?: number
  page_size?: number
  category_slug?: string
  tag_slug?: string
  keyword?: string
  sort?: string
}): Promise<ApiResponse<PaginatedResponse<ArticleListItem>>> {
  return get('/articles', params as Record<string, string | number | undefined>)
}

export async function getArticle(
  slug: string
): Promise<ApiResponse<ArticleListItem>> {
  return get(`/articles/${slug}`)
}

export async function createArticle(
  data: ArticleCreateRequest
): Promise<ApiResponse<{ id: string; slug: string }>> {
  return post('/articles', data)
}

export async function updateArticle(
  id: string,
  data: ArticleCreateRequest
): Promise<ApiResponse<{ id: string }>> {
  return put(`/articles/${id}`, data)
}

export async function deleteArticle(id: string): Promise<ApiResponse<null>> {
  return del(`/articles/${id}`)
}

export async function toggleArticleStatus(
  id: string,
  status: string
): Promise<ApiResponse<{ status: string }>> {
  return patch(`/articles/${id}/status`, { status })
}

export async function toggleLike(id: string): Promise<
  ApiResponse<{ is_liked: boolean; likes_count: number }>
> {
  return post(`/articles/${id}/like`)
}

export async function toggleFavorite(id: string): Promise<
  ApiResponse<{ is_favorited: boolean; favorites_count: number }>
> {
  return post(`/articles/${id}/favorite`)
}

export async function getFavorites(params?: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<ArticleListItem>>> {
  return get('/articles/favorites', params as Record<string, string | number | undefined>)
}

export async function getPinned(): Promise<ApiResponse<ArticleListItem[]>> {
  return get('/articles', { is_pinned: 'true' as unknown as string | number | undefined }).then(
    (res) => ({
      ...res,
      data: res.data?.items?.filter((a) => a.is_pinned).slice(0, 3) || [],
    })
  )
}

// ─── Categories API ───

export async function getCategories(): Promise<ApiResponse<Category[]>> {
  return get('/categories')
}

export async function getCategory(slug: string): Promise<ApiResponse<Category>> {
  return get(`/categories/${slug}`)
}

export async function createCategory(data: {
  name: string
  slug?: string
  description?: string
  order?: number
}): Promise<ApiResponse<Category>> {
  return post('/categories', data)
}

export async function updateCategory(
  id: string,
  data: Partial<Category>
): Promise<ApiResponse<Category>> {
  return put(`/categories/${id}`, data)
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  return del(`/categories/${id}`)
}

// ─── Tags API ───

export async function getTags(): Promise<ApiResponse<Tag[]>> {
  return get('/tags')
}

export async function getHotTags(limit: number = 10): Promise<ApiResponse<Tag[]>> {
  return get('/tags/hot', { limit })
}

export async function createTag(data: {
  name: string
  slug?: string
}): Promise<ApiResponse<Tag>> {
  return post('/tags', data)
}

export async function updateTag(
  id: string,
  data: { name?: string; slug?: string }
): Promise<ApiResponse<Tag>> {
  return put(`/tags/${id}`, data)
}

export async function deleteTag(id: string): Promise<ApiResponse<null>> {
  return del(`/tags/${id}`)
}

// ─── Media API ───

export async function getMedia(params?: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<MediaItem>>> {
  return get('/media', params as Record<string, string | number | undefined>)
}

export async function deleteMedia(id: string): Promise<ApiResponse<null>> {
  return del(`/media/${id}`)
}

export async function uploadImage(
  file: File
): Promise<
  ApiResponse<{
    id: string
    url: string
    thumbnail_url: string
    large_url: string
    filename: string
    size: number
    width: number
    height: number
    mime_type: string
    created_at: string
  }>
> {
  const formData = new FormData()
  formData.append('file', file)
  return upload('/upload/image', formData)
}

export async function uploadImages(
  files: File[]
): Promise<
  ApiResponse<
    Array<{
      id: string
      url: string
      thumbnail_url: string
      large_url: string
      filename: string
      size: number
      width: number
      height: number
      mime_type: string
      created_at: string
    }>
  >
> {
  const formData = new FormData()
  files.forEach((file) => formData.append('files', file))
  return upload('/upload/images', formData)
}

// ─── Users API ───

export async function getUsers(params?: {
  page?: number
  page_size?: number
}): Promise<ApiResponse<PaginatedResponse<User>>> {
  return get('/users', params as Record<string, string | number | undefined>)
}

export async function getUser(id: string): Promise<ApiResponse<User>> {
  return get(`/users/${id}`)
}

export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<ApiResponse<User>> {
  return put(`/users/${id}`, data)
}

export async function deleteUser(id: string): Promise<ApiResponse<null>> {
  return del(`/users/${id}`)
}

// ─── Settings API ───

export async function getPublicSettings(): Promise<ApiResponse<SiteSettings>> {
  return get('/settings/public')
}

export async function updateSettings(
  data: Partial<SiteSettings>
): Promise<ApiResponse<SiteSettings>> {
  return put('/settings', data)
}
