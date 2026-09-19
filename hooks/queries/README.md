# hooks/queries/ — React Query read hooks

Server-state READS live here. The worked chain (the whole point of this
folder):

```
repository (utils/supabase/repositories/)   — returns RepositoryResult<T>
        ↓
queryKeys factory (lib/react-query/queryKeys.ts)   — ['domain', 'list', id] shapes
        ↓
useXxx hook (this folder)                   — useQuery + queryKeys.xxx
```

## Worked example — copy, rename, extend

```ts
// hooks/queries/useRecords.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query';   // folder barrel (S5)
import { RecordRepository } from '../../utils/supabase/repositories';

export function useRecords(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.records.list(userId),   // extend queryKeys first —
    queryFn: async () => {                       // inline queryKey literals
      const result = await RecordRepository.listForUser(userId!);  // are an
      if (!result.success) throw result.error;   // S13 violation
      return result.data;
    },
    enabled: userId != null,                     // skip while signed out
  });
}
```

Before this compiles, add the key factory to `lib/react-query/queryKeys.ts`:

```ts
records: {
  all: ['records'] as const,
  list: (userId?: string) => [...queryKeys.records.all, 'list', userId] as const,
  detail: (id: string) => [...queryKeys.records.all, 'detail', id] as const,
},
```

## The rules the audits enforce

- **S13** — every `queryKey` goes through the `queryKeys` factory; inline
  `queryKey: ['records', id]` literals fail `audit-data-layer.ts`.
- **S9** — hooks never call `supabase.*` directly; they call repositories
  (or services). The repository unwraps to `RepositoryResult<T>`; the hook
  bridges to the throwing pipeline (React Query catches).
- **D6** — UI imports these hooks through the `@hooks` barrel or relative
  path; domain TYPES live in `shared/types/`, never inline in the hook file.
- Mutations that must survive offline go through
  `services/offlineQueueService.ts` — see ARCHITECTURE.md D4.

Write mutations in `hooks/mutations/`. Wire the offline queue's
flush-on-reconnect when you type your first queue (subscribe
`useNetworkStore`'s `useIsOnline` → your queue's `flush()`).
