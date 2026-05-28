import { render, screen } from '@testing-library/react'
import { ArticleCard } from '@/components/article/ArticleCard'
import type { ArticleListItem } from '@/lib/api'

const mockArticle: ArticleListItem = {
  id: 'a1',
  title: '测试文章标题',
  slug: 'test-article',
  summary: '这是一篇测试文章的摘要内容，用于测试 ArticleCard 组件的渲染。',
  cover_image: '',
  category: { id: 'c1', name: '技术', slug: 'tech' },
  tags: [
    { id: 't1', name: 'React', slug: 'react' },
    { id: 't2', name: 'TypeScript', slug: 'typescript' },
  ],
  author: { id: 'u1', nickname: '管理员', avatar: '' },
  views_count: 1280,
  likes_count: 56,
  comment_count: 12,
  is_pinned: false,
  is_liked: false,
  is_favorited: false,
  published_at: '2026-05-20T08:00:00Z',
  created_at: '2026-05-20T08:00:00Z',
  updated_at: '2026-05-20T08:00:00Z',
}

describe('ArticleCard', () => {
  it('renders article title', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByRole('heading', { name: '测试文章标题' })).toBeInTheDocument()
  })

  it('renders category badge', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('技术')).toBeInTheDocument()
  })

  it('renders tags', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('TypeScript')).toBeInTheDocument()
  })

  it('renders view and like counts', () => {
    render(<ArticleCard article={mockArticle} />)
    expect(screen.getByText('1280')).toBeInTheDocument()
    expect(screen.getByText('56')).toBeInTheDocument()
  })

  it('links to article detail', () => {
    render(<ArticleCard article={mockArticle} />)
    const heading = screen.getByRole('heading', { name: '测试文章标题' })
    const link = heading.closest('a')
    expect(link).toHaveAttribute('href', '/articles/test-article')
  })

  it('shows pinned badge when article is pinned', () => {
    render(<ArticleCard article={{ ...mockArticle, is_pinned: true }} />)
    expect(screen.getByText('置顶')).toBeInTheDocument()
  })

  it('renders compact variant', () => {
    render(<ArticleCard article={mockArticle} variant="compact" />)
    expect(screen.getByText('测试文章标题')).toBeInTheDocument()
  })
})
