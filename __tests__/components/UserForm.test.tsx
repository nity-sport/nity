import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '../../components/forms/UserForm/UserForm';
import { UserRole } from '../../src/types/auth';

describe('UserForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should render form fields', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/perfil de acesso/i)).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /criar usuário/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
    });
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'invalid-email');
    
    const submitButton = screen.getByRole('button', { name: /criar usuário/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  it('should validate password length', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    const passwordInput = screen.getByLabelText(/senha/i);
    await user.type(passwordInput, '123');
    
    const submitButton = screen.getByRole('button', { name: /criar usuário/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/senha deve ter pelo menos 6 caracteres/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    await user.type(screen.getByLabelText(/nome/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/senha/i), 'password123');
    await user.selectOptions(screen.getByLabelText(/perfil de acesso/i), UserRole.USER);
    
    const submitButton = screen.getByRole('button', { name: /criar usuário/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.USER
      });
    });
  });

  it('should render with initial data when editing', () => {
    const initialData = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: UserRole.MARKETING
    };
    
    render(
      <UserForm 
        onSubmit={mockOnSubmit} 
        initialData={initialData}
        isEditing={true}
      />
    );
    
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue(UserRole.MARKETING)).toBeInTheDocument();
  });

  it('should hide role selection when showRoleSelection is false', () => {
    render(
      <UserForm 
        onSubmit={mockOnSubmit} 
        showRoleSelection={false}
      />
    );
    
    expect(screen.queryByLabelText(/perfil de acesso/i)).not.toBeInTheDocument();
  });
});