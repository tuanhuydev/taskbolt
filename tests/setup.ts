import { vi, beforeEach, afterEach } from 'vitest';
import { setupShellServices, teardownShellServices } from './mocks/shell-services';

beforeEach(() => {
  setupShellServices();
  vi.clearAllMocks();
});

afterEach(() => {
  teardownShellServices();
});
