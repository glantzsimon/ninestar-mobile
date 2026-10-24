import { useSyncExternalStore } from 'react';
import { ThemedText } from '@/components/themed-text';
import { AppDisclosure } from '@/components/ui/app-disclosure';
import { useSession } from '@/hooks/use-session';
import { requestDiagnostics } from '@/lib/request-diagnostics';

export function RequestDiagnostics() {
  const rows = useSyncExternalStore(requestDiagnostics.subscribe, requestDiagnostics.getSnapshot, requestDiagnostics.getSnapshot);
  const { generation, status } = useSession();
  return (
    <AppDisclosure title="Request Diagnostics">
      <ThemedText type="small">Session g{generation}: {status}. Pending requests: {rows.filter((row) => row.outcome === 'pending').length}.</ThemedText>
      <ThemedText type="small">Recent requests only; no profile details, credentials or cookies.</ThemedText>
      {rows.slice().reverse().map((row) => <ThemedText key={row.id} type="small" selectable>
        #{row.id} {row.method} {row.endpoint} · g{row.generation} · {row.status ?? 'no HTTP status'} · {row.outcome}
        {row.elapsedMs !== undefined ? ` · ${row.elapsedMs} ms` : ''}
        {row.outcome !== 'success' ? ` · waiting for ${row.phase}` : ''}
      </ThemedText>)}
    </AppDisclosure>
  );
}
