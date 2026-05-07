export interface EnvConfig {
  appEnv: string;
  apiBaseUrl: string;
  useMocks: boolean;
}

export const env: EnvConfig = {
  appEnv: import.meta.env.VITE_APP_ENV || 'local',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  useMocks: import.meta.env.VITE_USE_MOCKS === 'true',
};
