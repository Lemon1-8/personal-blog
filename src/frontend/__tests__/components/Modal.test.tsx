import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal } from '@/components/ui/Modal'

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByText('Content')).not.toBeInTheDocument()
  })

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <p>Modal Content</p>
      </Modal>
    )
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="测试标题">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('测试标题')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const onClose = jest.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="标题">
        <p>Content</p>
      </Modal>
    )
    const closeButton = screen.getByRole('button')
    await userEvent.click(closeButton)
    expect(onClose).toHaveBeenCalled()
  })

  it('has proper aria attributes', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()}>
        <p>Content</p>
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })
})
