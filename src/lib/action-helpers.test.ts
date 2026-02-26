import { describe, it, expect } from 'vitest';
import { ok, err, unauthorized, type ActionResult } from './action-helpers';

describe('ok', () => {
  it('returns success response with data', () => {
    const result = ok({ id: '1', name: 'test' });

    expect(result).toEqual({
      success: true,
      data: { id: '1', name: 'test' },
    });
  });

  it('returns success response with primitive data', () => {
    const result = ok('simple string');

    expect(result).toEqual({
      success: true,
      data: 'simple string',
    });
  });

  it('returns success response with null data', () => {
    const result = ok(null);

    expect(result).toEqual({
      success: true,
      data: null,
    });
  });

  it('returns success response with array data', () => {
    const result = ok([1, 2, 3]);

    expect(result).toEqual({
      success: true,
      data: [1, 2, 3],
    });
  });
});

describe('err', () => {
  it('returns error response with Error message', () => {
    const error = new Error('Something went wrong');
    const result = err(error, 'Fallback message');

    expect(result).toEqual({
      success: false,
      error: 'Something went wrong',
    });
  });

  it('returns error response with fallback for non-Error', () => {
    const result = err('string error', 'Fallback message');

    expect(result).toEqual({
      success: false,
      error: 'Fallback message',
    });
  });

  it('returns error response with fallback for null', () => {
    const result = err(null, 'Fallback message');

    expect(result).toEqual({
      success: false,
      error: 'Fallback message',
    });
  });

  it('returns error response with fallback for undefined', () => {
    const result = err(undefined, 'Fallback message');

    expect(result).toEqual({
      success: false,
      error: 'Fallback message',
    });
  });
});

describe('unauthorized', () => {
  it('returns failure response with Unauthorized message', () => {
    const result = unauthorized();

    expect(result).toEqual({
      success: false,
      error: 'Unauthorized',
    });
  });

  it('returns ActionResult type compatible with other helpers', () => {
    const result: ActionResult<never> = unauthorized();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Unauthorized');
    }
  });
});

describe('ActionResult type', () => {
  it('discriminates success and error variants', () => {
    const successResult: ActionResult<string> = ok('data');
    const errorResult: ActionResult<string> = err(
      new Error('fail'),
      'Fallback'
    );

    if (successResult.success) {
      expect(successResult.data).toBe('data');
    } else {
      expect.fail('Should be success variant');
    }

    if (!errorResult.success) {
      expect(errorResult.error).toBe('fail');
    } else {
      expect.fail('Should be error variant');
    }
  });
});
