import { parseContextualHelp, type ContextualHelp } from './contextual-help';

export type AiAstrologerContent = { help: ContextualHelp | null; externalUrl: string | null };

export function parseAiAstrologerContent(value: unknown): AiAstrologerContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return { help: null, externalUrl: null };
  const data = value as Record<string, unknown>;
  const help = parseContextualHelp({ overview: data }).overview ?? null;
  let externalUrl: string | null = null;
  if (typeof data.externalUrl === 'string' && data.externalUrl.trim()) {
    try {
      const parsed = new URL(data.externalUrl);
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') externalUrl = parsed.href;
    } catch { /* An invalid destination hides the launch action only. */ }
  }
  return { help, externalUrl };
}
