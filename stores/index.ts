// stores/index.ts
// Barrel for cross-cutting Zustand stores. Domain stores are added by
// consumers and re-exported here.

export { useAuthStore, type AuthStatus } from './authStore';
export {
  useNetworkStore,
  useIsOnline,
  getNetworkStatus,
  initializeNetworkListeners,
} from './networkStore';
export { zustandStorage } from './storage';
