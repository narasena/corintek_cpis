/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiSelect } from './multi-select';
import React from 'react';

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
    const badge = screen.getByText('Option 1').parentElement;
    const removeButton = badge?.querySelector('div[role="button"]');
    
    if (removeButton) {
      fireEvent.click(removeButton);
    }
    
    expect(onChange).toHaveBeenCalledWith(['2']);
  });

  it('calls onChange with keyboard Enter on badge remove button', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={['1']} onChange={onChange} />);
    
    const badge = screen.getByText('Option 1').parentElement;
    const removeButton = badge?.querySelector('div[role="button"]');
    
    if (removeButton) {
      fireEvent.keyDown(removeButton, { key: 'Enter' });
    }
    
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('handles mousedown and stopPropagation on remove button', () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={['1']} onChange={onChange} />);
    
    const badge = screen.getByText('Option 1').parentElement;
    const removeButton = badge?.querySelector('div[role="button"]');
    
    if (removeButton) {
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      const spy = vi.spyOn(event, 'stopPropagation');
      fireEvent(removeButton, event);
      expect(spy).toHaveBeenCalled();
    }
  });

  it('opens popover and allows selecting an item', async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={[]} onChange={onChange} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    // In JSDOM, we might need to check how Radix Popover renders
    // Usually it's in a portal. CommandItems should be visible now.
    const item1 = screen.getByRole('option', { name: 'Option 1' });
    fireEvent.click(item1);
    
    expect(onChange).toHaveBeenCalledWith(['1']);
  });

  it('allows deselecting an item from the list', async () => {
    const onChange = vi.fn();
    render(<MultiSelect options={options} selected={['1']} onChange={onChange} />);
    
    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);
    
    const item1 = screen.getByRole('option', { name: 'Option 1' });
    fireEvent.click(item1);
    
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
