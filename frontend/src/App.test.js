import { render, screen } from '@testing-library/react';
import App from './App';

test('renders SecureBank login page', () => {
  render(<App />);
  const bankName = screen.getByText(/SecureBank/i);
  expect(bankName).toBeInTheDocument();
});

test('renders welcome message', () => {
  render(<App />);
  const welcomeMessage = screen.getByText(/Welcome Back/i);
  expect(welcomeMessage).toBeInTheDocument();
});

test('renders sign in button', () => {
  render(<App />);
  const signInButton = screen.getByRole('button', { name: /sign in/i });
  expect(signInButton).toBeInTheDocument();
});