import { render, screen } from '@testing-library/react'
import { Loading, SkeletonCard, SkeletonList } from '@/components/ui/Loading'

describe('Loading', () => {
  it('renders spinner', () => {
    const { container } = render(<Loading />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    // Check that the spinner class is present on the container div's child
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders with text', () => {
    render(<Loading text="加载中..." />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { container } = render(<Loading size="lg" />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    const classStr = typeof spinner?.className === 'string' ? spinner.className : (spinner as SVGElement).getAttribute('class') || ''
    expect(classStr).toContain('w-12')
  })
})

describe('SkeletonCard', () => {
  it('renders skeleton placeholders', () => {
    const { container } = render(<SkeletonCard />)
    const divs = container.querySelectorAll('div')
    expect(divs.length).toBeGreaterThan(0)
  })
})

describe('SkeletonList', () => {
  it('renders correct number of skeleton cards', () => {
    const { container } = render(<SkeletonList count={3} />)
    const animatedDivs = container.querySelectorAll('.animate-pulse')
    expect(animatedDivs.length).toBe(3)
  })
})
