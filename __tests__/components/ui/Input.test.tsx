import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from '@/components/ui/Input'

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('applies correct base classes', () => {
    render(<Input data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('input')
  })

  it('handles value changes', () => {
    const handleChange = jest.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('shows error state when error prop is true', () => {
    render(<Input error data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('border-destructive', 'focus-visible:ring-destructive')
  })

  it('displays helper text', () => {
    render(<Input helperText="This is helper text" />)
    expect(screen.getByText('This is helper text')).toBeInTheDocument()
  })

  it('displays error helper text with error styling', () => {
    render(<Input error helperText="This is an error message" />)
    const helperText = screen.getByText('This is an error message')
    expect(helperText).toBeInTheDocument()
    expect(helperText).toHaveClass('text-destructive')
  })

  it('displays normal helper text without error styling', () => {
    render(<Input helperText="This is normal helper text" />)
    const helperText = screen.getByText('This is normal helper text')
    expect(helperText).toBeInTheDocument()
    expect(helperText).toHaveClass('text-muted-foreground')
  })

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toHaveClass('custom-input')
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input type="email" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'email')

    rerender(<Input type="password" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'password')

    rerender(<Input type="number" data-testid="input" />)
    expect(screen.getByTestId('input')).toHaveAttribute('type', 'number')
  })

  it('can be disabled', () => {
    render(<Input disabled data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeDisabled()
  })

  it('can be required', () => {
    render(<Input required data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input).toBeRequired()
  })

  it('forwards ref correctly', () => {
    const ref = { current: null }
    render(<Input ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLInputElement)
  })

  it('handles focus and blur events', () => {
    const handleFocus = jest.fn()
    const handleBlur = jest.fn()
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />)
    
    const input = screen.getByRole('textbox')
    
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()
    
    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })
})
