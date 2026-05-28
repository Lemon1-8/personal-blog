import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="用户名" />)
    expect(screen.getByText('用户名')).toBeInTheDocument()
    expect(screen.getByLabelText('用户名')).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="请输入" />)
    expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="密码" error="密码错误" />)
    expect(screen.getByText('密码错误')).toBeInTheDocument()
  })

  it('applies error styles', () => {
    render(<Input error="错误" />)
    const input = screen.getByRole('textbox')
    expect(input.className).toContain('border-red-500')
  })

  it('calls onChange when typing', async () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello')
    expect(handleChange).toHaveBeenCalled()
  })

  it('disables input', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})
