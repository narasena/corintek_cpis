/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from './multi-select';

describe('MultiSelect Characterization', () => {
  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
  ];

  it('renders placeholder when nothing is selected', () => {
    render(<MultiSelect options={options} selected={[]} onChange={() => {}} placeholder="Select items" />);
    expect(screen.getByText('Select items')).toBeDefined();
  });

  it('renders selected items as badges', () => {
    render(<MultiSelect options={options} selected={['1']} onChange={() => {}} />);
    expect(screen.getByText('Option 1')).toBeDefined();
  });

  it('calls onChange when removing an item via badge click', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={['1', '2']} onChange={onChange} />);
    
    // Find the X icon container (role button) for Option 1
    const badge = screen.getByText('Option 1').closest('span');
    const removeButton = badge?.querySelector('div[role="button"]');
    
    if (removeButton) {
      fireEvent.click(removeButton);
    }
    
    expect(onChange).toHaveBeenCalledWith(['2']);
  });
});
