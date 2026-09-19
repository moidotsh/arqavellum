# hooks/mutations/ — React Query write hooks

Server-state WRITES live here. A mutation owns its cache contract: it must
touch a cache primitive (`invalidateQueries` / `setQueryData` /
`removeQueries` / `.clear()`) in `onSuccess` or `onSettled` — audit D3
blocks `useMutation` calls that don't.

## Worked example — copy, rename, extend

```ts
// hooks/mutations/useSaveRecord.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../lib/react-query';   // folder barrel (S5)
import { RecordRepository } from '../../utils/supabase/repositories';

export function useSaveRecord(userId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['records', 'save'],
    mutationFn: async (input: RecordInput) => {
      const result = await RecordRepository.create(input);
      if (!result.success) throw result.error;   // structured failure → RQ retry policy
      return result.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.records.list(userId) });
    },
  });
}
```

## The rules the audits enforce

- **D3** — the cache touch above is load-bearing; `audit-state.ts` fails a
  mutation without one. Updates to an existing entry should apply an
  optimistic update (`onMutate` → `setQueryData` → `onError` rollback).
- **S13** — mutation keys follow the same factory discipline; add a
  `mutationKey` entry to `queryKeys` when the domain grows.
- **S9** — the mutation calls a repository, never `supabase.*`.
- Auth-class failures (401 / session expired) are handled centrally:
  `AuthProvider` registers the handler that clears the session, so a
  mutation doesn't need its own sign-out plumbing.

Reads live in `hooks/queries/` (see its README for the full chain).
