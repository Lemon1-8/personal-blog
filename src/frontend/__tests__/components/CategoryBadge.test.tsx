import { render, screen } from '@testing-library/react'
import { CategoryBadge } from '@/components/ui/CategoryBadge'

describe('CategoryBadge', () => {
  it('renders category name', () => {
    render(<CategoryBadge name="技术" slug="tech" />)
    expect(screen.getByText('技术')).toBeInTheDocument()
  })

  it('renders link with correct href', () => {
    render(<CategoryBadge name="生活" slug="life" />)
    const link = screen.getByText('生活')
    expect(link.closest('a')).toHaveAttribute('href', '/categories/life')
  })

  it('renders with custom className', () => {
    render(<CategoryBadge name="技术" slug="tech" className="custom-class" />)
    const link = screen.getByText('技术')
    expect(link.className).toContain('custom-class')
  })
})
