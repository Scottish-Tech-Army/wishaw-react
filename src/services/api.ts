import { env } from '../config/env';
import { mockApi } from '../mocks/mock-api';
import { realApi } from './api-client';

// Unified API: delegates to mock or real based on VITE_USE_MOCKS env flag
export const api = env.useMocks ? mockApi : (realApi as unknown as typeof mockApi);
export default api;
