import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AppLayout from '@/components/AppLayout';

describe('AppLayout', () => {
  it('renders without crashing', () => {
    render(<AppLayout />);
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });

  it('toggles sidebar visibility', () => {
    render(<AppLayout />);
    const sidebar = screen.getByTestId('sidebar');
    const toggleButton = screen.getByTestId('toggle-sidebar');

    // Initially sidebar should be open (w-64)
    expect(sidebar).toHaveClass('w-64');

    // Click toggle button
    fireEvent.click(toggleButton);

    // Sidebar should be collapsed (w-16)
    expect(sidebar).toHaveClass('w-16');
  });

  it('switches between chat and documents view', () => {
    render(<AppLayout />);
    const chatButton = screen.getByTestId('chat-button');
    const documentsButton = screen.getByTestId('documents-button');

    // Initially chat view should be active
    expect(chatButton).toHaveClass('bg-secondary');
    expect(documentsButton).not.toHaveClass('bg-secondary');

    // Switch to documents view
    fireEvent.click(documentsButton);

    // Documents view should be active
    expect(documentsButton).toHaveClass('bg-secondary');
    expect(chatButton).not.toHaveClass('bg-secondary');
  });
});