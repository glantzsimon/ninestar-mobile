import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useSession } from '@/hooks/use-session';
import { parseKnowledgeBase, type KnowledgeReading } from '@/lib/knowledge-base';
import { mobileApiRequest, MobileApiError } from '@/lib/mobile-api';
import { session } from '@/lib/session';

type KnowledgeState = { sections: KnowledgeReading[]; loading: boolean; failed: boolean; retry: () => void };
const KnowledgeContext = createContext<KnowledgeState | null>(null);
export function useKnowledgeBase() {
  const state = useContext(KnowledgeContext);
  if (!state) throw new Error('Knowledge Base provider missing');
  return state;
}
// One in-memory response for this navigation stack, shared by all intermediate
// screens. It is discarded on leaving the stack or changing session generation.
export function KnowledgeBaseProvider({ children }: PropsWithChildren) {
  const { generation } = useSession();
  return <KnowledgeScope key={generation}>{children}</KnowledgeScope>;
}
function KnowledgeScope({ children }: PropsWithChildren) {
  const [sections, setSections] = useState<KnowledgeReading[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    const generation = session.getSnapshot().generation;
    void mobileApiRequest('knowledge-base').then(response => {
      if (!active || generation !== session.getSnapshot().generation) return;
      const next = parseKnowledgeBase(response.data);
      if (!next.length) throw new MobileApiError('invalid_response');
      setSections(next);
    }).catch(() => {
      if (active && generation === session.getSnapshot().generation) setFailed(true);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [attempt]);
  function retry() { setLoading(true); setFailed(false); setAttempt(value => value + 1); }
  return <KnowledgeContext.Provider value={{ sections, loading, failed, retry }}>{children}</KnowledgeContext.Provider>;
}
