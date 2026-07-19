// utils/supabase/repositories/index.ts
// Barrel for the repository pattern. Domain-agnostic — consumers add
// concrete repositories (e.g. `WorkoutRepository`) to this folder and
// re-export them here. The audit gate (S9) treats this folder as the
// single legitimate home for direct `supabase.*` calls.

export {
  type RepositoryResult,
  RepositoryError,
  RepositoryErrorCode,
  ok,
  err,
  validateWithSchema,
  classifySupabaseError,
  handleRepositoryError,
  unauthorized,
  throwIfFailed,
} from './types';
