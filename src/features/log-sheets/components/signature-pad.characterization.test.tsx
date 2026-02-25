/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SignaturePad } from './signature-pad';

const mockCtx = {
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  drawImage: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  strokeText: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  createLinearGradient: vi.fn(),
  createRadialGradient: vi.fn(),
  createPattern: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(),
  setLineDash: vi.fn(),
  getLineDash: vi.fn(() => []),
  lineCap: '',
  lineJoin: '',
  lineWidth: 0,
  strokeStyle: '',
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
  globalAlpha: 1,
  globalCompositeOperation: '',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'high' as ImageSmoothingQuality,
  filter: '',
  shadowBlur: 0,
  shadowColor: '',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  miterLimit: 0,
  shadowOffset: 0,
};

const mockToDataURL = vi.fn(() => 'data:image/png;base64,mock-signature-data');

describe('SignaturePad - characterization', () => {
  let containerRef: HTMLDivElement | null;

  beforeEach(() => {
    vi.clearAllMocks();

    HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
      if (contextId === '2d') {
        return mockCtx as unknown as CanvasRenderingContext2D;
      }
      return null;
    }) as typeof HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.toDataURL = mockToDataURL;

    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        width: 300,
        height: 168.75,
        top: 0,
        left: 0,
        right: 300,
        bottom: 168.75,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }),
    });

    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: 2,
    });

    containerRef = null;
  });

  afterEach(() => {
    if (containerRef) {
      containerRef.remove();
    }
  });

  describe('initial rendering', () => {
    it('renders canvas element (main path)', async () => {
      const { container } = render(<SignaturePad />);

      const canvas = container.querySelector('canvas');
      expect(canvas).toBeTruthy();
    });

    it('renders clear button with "Ulangi" text (main path)', async () => {
      render(<SignaturePad />);

      expect(screen.getByRole('button', { name: /ulangi/i })).toBeTruthy();
    });

    it('renders save button with "Simpan" text (main path)', async () => {
      render(<SignaturePad />);

      expect(screen.getByRole('button', { name: /simpan/i })).toBeTruthy();
    });

    it('save button is disabled initially when no stroke (main path)', async () => {
      render(<SignaturePad />);

      const saveButton = screen.getByRole('button', { name: /simpan/i });
      expect(saveButton).toHaveProperty('disabled', true);
    });

    it('applies touch-none class for mobile drawing (main path)', async () => {
      const { container } = render(<SignaturePad />);

      const wrapper = container.querySelector('.touch-none');
      expect(wrapper).toBeTruthy();
    });
  });

  describe('disabled state', () => {
    it('disables clear button when disabled prop is true (main path)', async () => {
      render(<SignaturePad disabled />);

      const clearButton = screen.getByRole('button', { name: /ulangi/i });
      expect(clearButton).toHaveProperty('disabled', true);
    });

    it('disables save button when disabled prop is true (main path)', async () => {
      render(<SignaturePad disabled />);

      const saveButton = screen.getByRole('button', { name: /simpan/i });
      expect(saveButton).toHaveProperty('disabled', true);
    });

    it('does not start drawing when disabled (edge case)', async () => {
      const user = userEvent.setup();
      render(<SignaturePad disabled />);

      const canvas = document.querySelector('canvas')!;
      await user.pointer({ target: canvas, keys: '[MouseLeft]' });

      expect(mockCtx.beginPath).not.toHaveBeenCalled();
    });
  });

  describe('drawing interaction', () => {
    it('starts path on pointer down (main path)', async () => {
      render(<SignaturePad />);

      const canvas = document.querySelector('canvas')!;
      fireEvent.pointerDown(canvas, {
        clientX: 100,
        clientY: 50,
        pointerId: 1,
      });

      expect(mockCtx.beginPath).toHaveBeenCalled();
      expect(mockCtx.moveTo).toHaveBeenCalled();
    });

    it('draws line on pointer move while drawing (main path)', async () => {
      render(<SignaturePad />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });

      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      expect(mockCtx.lineTo).toHaveBeenCalled();
      expect(mockCtx.stroke).toHaveBeenCalled();
    });

    it('closes path on pointer up (main path)', async () => {
      render(<SignaturePad />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });

      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      fireEvent.pointerUp(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      expect(mockCtx.closePath).toHaveBeenCalled();
    });

    it('does not draw line when not in drawing state (edge case)', async () => {
      render(<SignaturePad />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      expect(mockCtx.lineTo).not.toHaveBeenCalled();
    });
  });

  describe('clear functionality', () => {
    it('clears canvas on clear button click (main path)', async () => {
      const user = userEvent.setup();
      render(<SignaturePad />);

      const clearButton = screen.getByRole('button', { name: /ulangi/i });
      await user.click(clearButton);

      expect(mockCtx.clearRect).toHaveBeenCalled();
      expect(mockCtx.fillRect).toHaveBeenCalled();
    });

    it('resets hasStroke state on clear (main path)', async () => {
      const user = userEvent.setup();
      render(<SignaturePad />);

      const canvas = document.querySelector('canvas')!;
      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      const saveButton = screen.getByRole('button', { name: /simpan/i });
      expect(saveButton).toHaveProperty('disabled', false);

      const clearButton = screen.getByRole('button', { name: /ulangi/i });
      await user.click(clearButton);

      expect(saveButton).toHaveProperty('disabled', true);
    });
  });

  describe('onChange callback', () => {
    it('calls onChange with data URL after stroke ends (main path)', async () => {
      const onChange = vi.fn();
      render(<SignaturePad onChange={onChange} />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      expect(onChange).toHaveBeenCalledWith(
        'data:image/png;base64,mock-signature-data'
      );
    });

    it('calls onChange with null when cleared (main path)', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<SignaturePad onChange={onChange} />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      onChange.mockClear();

      const clearButton = screen.getByRole('button', { name: /ulangi/i });
      await user.click(clearButton);

      expect(onChange).toHaveBeenCalledWith(null);
    });

    it('save button click calls onChange with current data URL (main path)', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<SignaturePad onChange={onChange} />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });
      fireEvent.pointerUp(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      onChange.mockClear();

      const saveButton = screen.getByRole('button', { name: /simpan/i });
      await user.click(saveButton);

      expect(onChange).toHaveBeenCalledWith(
        'data:image/png;base64,mock-signature-data'
      );
    });

    it('does not call onChange when no stroke exists (edge case)', async () => {
      const onChange = vi.fn();
      const user = userEvent.setup();
      render(<SignaturePad onChange={onChange} />);

      const saveButton = screen.getByRole('button', { name: /simpan/i });
      expect(saveButton).toHaveProperty('disabled', true);

      await user.click(saveButton);

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('pointer leave behavior', () => {
    it('finishes stroke on pointer leave (main path)', async () => {
      render(<SignaturePad />);

      const canvas = document.querySelector('canvas')!;

      fireEvent.pointerDown(canvas, {
        clientX: 50,
        clientY: 30,
        pointerId: 1,
      });
      fireEvent.pointerMove(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });
      fireEvent.pointerLeave(canvas, {
        clientX: 100,
        clientY: 60,
        pointerId: 1,
      });

      expect(mockCtx.closePath).toHaveBeenCalled();
    });
  });
});
