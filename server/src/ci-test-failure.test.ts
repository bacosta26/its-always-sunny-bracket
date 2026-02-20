// Intentional test failure for CI Log Lens testing — delete after test
import { describe, it, expect } from 'vitest';

describe('ci-test-failure', () => {
  it('should pass but intentionally fails', () => {
    expect(1 + 1).toBe(3);
  });
});
