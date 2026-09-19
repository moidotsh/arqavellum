// services/base/index.ts
// Barrel for service base classes. Consumers add concrete services
// (e.g. RecordService, CatalogService) to `services/` and re-export
// from a `services/index.ts` barrel.

export { BaseQueueService } from './BaseQueueService';
