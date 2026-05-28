import { render, screen } from '@testing-library/react'
import { Tag } from '@/components/ui/Tag'

describe('Tag', () => {
  it('renders tag name', () => {
    render(<Tag name="JavaScript" slug="javascript" />)
    expect(screen.getByText('JavaScript')).toBeInTheDocument()
  })

  it('renders as link when clickable', () => {
    render(<Tag name="React" slug="react" clickable />)
    const link = screen.getByText('React')
    expect(link.closest('a')).toHaveAttribute('href', '/tags/react')
  })

  it('renders as span when not clickable', () => {
    render(<Tag name="CSS" slug="css" clickable={false} />)
    const el = screen.getByText('CSS')
    expect(el.closest('a')).toBeNull()
    expect(el.closest('span')).toBeInTheDocument()
  })

  it('applies primary variant', () => {
    render(<Tag name="Python" slug="python" variant="primary" />)
    const tag = screen.getByText('Python')
    expect(tag.className).toContain('bg-blue-100')
  })

  it('applies small size by default', () => {
    render(<Tag name="TS" slug="ts" />)
    const tag = screen.getByText('TS')
    expect(tag.className).toContain('text-xs')
  })
})
