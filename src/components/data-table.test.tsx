/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable } from './data-table';
import { ColumnDef } from '@tanstack/react-table';

// Mock ResizeObserver which is needed by Radix/Shadcn UI in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

interface ITestData {
  id: string;
  name: string;
}

const columns: ColumnDef<ITestData>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'name', header: 'Name' },
];

const data: ITestData[] = [
  { id: '1', name: 'Test 1' },
  { id: '2', name: 'Test 2' },
];

describe('DataTable Logic Characterization', () => {
  it('renders data correctly without tabs', () => {
    render(<DataTable columns={columns} data={data} />);
    
    // Should find multiple (Desktop and Mobile view)
    expect(screen.getAllByText('Test 1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Test 2').length).toBeGreaterThanOrEqual(1);
  });

  it('renders empty message when no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="No results found" />);
    
    expect(screen.getAllByText('No results found').length).toBeGreaterThanOrEqual(1);
  });

  it('renders active tab data when tabs are provided', () => {
    const tabs = [
      {
        value: 'tab1',
        label: 'Tab 1',
        data: [{ id: 't1', name: 'Tab 1 Data' }],
        columns: columns,
      },
      {
        value: 'tab2',
        label: 'Tab 2',
        data: [{ id: 't2', name: 'Tab 2 Data' }],
        columns: columns,
      }
    ];

    render(<DataTable columns={columns} data={[]} tabs={tabs} tab="tab1" />);
    
    expect(screen.getAllByText('Tab 1 Data').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Tab 2 Data')).toBeNull();
  });

  it('switches data when tab changes', () => {
    const tabs = [
      {
        value: 'tab1',
        label: 'Tab 1',
        data: [{ id: 't1', name: 'Tab 1 Data' }],
        columns: columns,
      },
      {
        value: 'tab2',
        label: 'Tab 2',
        data: [{ id: 't2', name: 'Tab 2 Data' }],
        columns: columns,
      }
    ];

    const { rerender } = render(<DataTable columns={columns} data={[]} tabs={tabs} tab="tab1" />);
    expect(screen.getAllByText('Tab 1 Data').length).toBeGreaterThanOrEqual(1);

    rerender(<DataTable columns={columns} data={[]} tabs={tabs} tab="tab2" />);
    expect(screen.getAllByText('Tab 2 Data').length).toBeGreaterThanOrEqual(1);
  });
});
