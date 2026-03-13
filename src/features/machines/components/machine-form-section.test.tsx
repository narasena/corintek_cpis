/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useForm, FormProvider } from 'react-hook-form';
import { MachineFormSection } from './machine-form-section';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

function TestWrapper() {
  const methods = useForm({
    defaultValues: {
      machines: [],
    },
  });

  return (
    <FormProvider {...methods}>
      <MachineFormSection control={methods.control as any} />
    </FormProvider>
  );
}

describe('MachineFormSection Characterization', () => {
  it('renders initial empty state', () => {
    render(<TestWrapper />);
    expect(screen.getByText(/Belum ada mesin/i)).toBeDefined();
  });

  it('adds a chiller when button is clicked', async () => {
    render(<TestWrapper />);

    const addButton = screen.getByText(/Tambah Chiller/i);
    fireEvent.click(addButton);

    expect(screen.getByText('Chiller #1')).toBeDefined();
    expect(screen.queryByText(/Belum ada mesin/i)).toBeNull();
  });

  it('adds a cooling tower when button is clicked', async () => {
    render(<TestWrapper />);

    const addButton = screen.getByText(/Tambah Cooling Tower/i);
    fireEvent.click(addButton);

    expect(screen.getByText('Cooling Tower #1')).toBeDefined();
  });

  it('groups machines by type', async () => {
    render(<TestWrapper />);

    const addChillerBtn = screen.getByText(/Tambah Chiller/i);
    const addCTBtn = screen.getByText(/Tambah Cooling Tower/i);

    fireEvent.click(addChillerBtn);
    fireEvent.click(addCTBtn);
    fireEvent.click(addChillerBtn);

    // Should have headings for both groups
    expect(screen.getByText('Chiller (2)')).toBeDefined();
    expect(screen.getByText('Cooling Tower (1)')).toBeDefined();

    // Should have specific card labels
    expect(screen.getByText('Chiller #1')).toBeDefined();
    expect(screen.getByText('Chiller #2')).toBeDefined();
    expect(screen.getByText('Cooling Tower #1')).toBeDefined();
  });
});
