/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { VirtualList } from './virtual-list';

interface TestItem {
  id: string;
  name: string;
}

const testData: TestItem[] = Array.from({ length: 100 }, (_, i) => ({
  id: String(i),
  name: `Item ${i}`,
}));

describe('VirtualList', () => {
  it('renders empty state message when no data', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={[]}
        renderItem={({ item }) => <div>{item.name}</div>}
        emptyMessage="No items found"
      />
    );
    expect(container.textContent).toContain('No items found');
  });

  it('renders visible items only', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={({ item }) => <div data-testid="item">{item.name}</div>}
        containerHeight={200}
        itemHeight={50}
        overscan={2}
      />
    );

    // Should render approximately containerHeight/itemHeight + 2*overscan items
    // 200/50 = 4 visible + 4 overscan = ~8 items
    const items = container.querySelectorAll('[data-testid="item"]');
    expect(items.length).toBeLessThanOrEqual(10);
    expect(items.length).toBeGreaterThan(0);
  });

  it('applies custom container className', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={({ item }) => <div>{item.name}</div>}
        className="custom-list"
      />
    );
    const listContainer = container.querySelector('.custom-list');
    expect(listContainer).toBeTruthy();
  });

  it('renders with correct total height', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={({ item }) => <div>{item.name}</div>}
        itemHeight={50}
      />
    );

    // Find the inner container with relative positioning
    const innerDiv = container.querySelector('[style*="position: relative"]');
    expect(innerDiv?.getAttribute('style')).toContain('height: 5000px');
  });

  it('positions items absolutely', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={({ item }) => <div>{item.name}</div>}
        itemHeight={50}
      />
    );

    const item = container.querySelector('[style*="position: absolute"]');
    expect(item).toBeTruthy();
  });

  it('provides correct index to renderItem', () => {
    const renderSpy = vi.fn(({ item }: { item: TestItem }) => (
      <div>{item.name}</div>
    ));

    render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={renderSpy}
        containerHeight={100}
        itemHeight={50}
        overscan={0}
      />
    );

    // Should receive index 0 for first item
    expect(renderSpy).toHaveBeenCalledWith(
      expect.objectContaining({ index: 0 })
    );
  });

  it('provides isVisible as true for visible items', () => {
    const renderSpy = vi.fn(({ item }: { item: TestItem }) => (
      <div>{item.name}</div>
    ));

    render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={renderSpy}
        containerHeight={100}
        itemHeight={50}
      />
    );

    expect(renderSpy).toHaveBeenCalledWith(
      expect.objectContaining({ isVisible: true })
    );
  });

  it('handles custom item height', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={[{ id: '1', name: 'Test' }]}
        renderItem={({ item }) => <div>{item.name}</div>}
        itemHeight={100}
      />
    );

    const item = container.querySelector('div > div > div');
    expect(item?.getAttribute('style')).toContain('height: 100px');
  });

  it('handles custom container height', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={({ item }) => <div>{item.name}</div>}
        containerHeight={300}
      />
    );

    const listContainer = container.firstChild as HTMLElement;
    expect(listContainer?.getAttribute('style')).toContain('height: 300px');
  });

  it('applies overscan correctly', () => {
    const renderSpy = vi.fn(({ item }: { item: TestItem }) => (
      <div>{item.name}</div>
    ));

    render(
      <VirtualList<TestItem>
        data={testData}
        renderItem={renderSpy}
        containerHeight={100}
        itemHeight={50}
        overscan={3}
      />
    );

    // With containerHeight=100 and itemHeight=50, we can fit 2 items
    // With overscan=3, we should render 2 + 2*3 = 8 items
    const callCount = renderSpy.mock.calls.length;
    expect(callCount).toBeLessThanOrEqual(8);
    expect(callCount).toBeGreaterThan(2);
  });

  it('renders single item correctly', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={[{ id: '1', name: 'Single' }]}
        renderItem={({ item }) => <div>{item.name}</div>}
      />
    );

    expect(container.textContent).toContain('Single');
  });

  it('handles very large datasets', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => ({
      id: String(i),
      name: `Item ${i}`,
    }));

    const { container } = render(
      <VirtualList<TestItem>
        data={largeData}
        renderItem={({ item }) => <div>{item.name}</div>}
        containerHeight={200}
        itemHeight={50}
      />
    );

    // Should only render a small subset of the 10000 items
    const renderedItems = container.querySelectorAll(
      '[style*="position: absolute"]'
    );
    expect(renderedItems.length).toBeLessThan(20);
    expect(renderedItems.length).toBeGreaterThan(0);
  });

  it('passes item data to renderItem', () => {
    const { container } = render(
      <VirtualList<TestItem>
        data={[{ id: '1', name: 'Test Item' }]}
        renderItem={({ item }) => <div>{item.name}</div>}
      />
    );

    expect(container.textContent).toContain('Test Item');
  });
});
