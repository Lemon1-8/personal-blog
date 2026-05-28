import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@/components/ui/Pagination'

describe('Pagination', () => {
  it('renders nothing when totalPages <= 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders page buttons', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={jest.fn()} />)
    const page3 = screen.getByText('3')
    expect(page3.className).toContain('bg-blue-600')
  })

  it('calls onPageChange when clicking a page', async () => {
    const onPageChange = jest.fn()
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByText('2'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons[buttons.length - 1]).toBeDisabled()
  })
})
