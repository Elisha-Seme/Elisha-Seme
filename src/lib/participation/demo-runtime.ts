import { opportunities, social as seededSocial } from './demo';
import { LocalDemoAiProvider } from './ai/LocalDemoAiProvider';

export type DemoSubmission = {
  id: string;
  opportunityId: string;
  reference: string;
  county?: string;
  channel: 'web' | 'whatsapp_demo';
  freeText?: string;
  answers: Array<{ questionId: string; value: string[] }>;
  submittedAt: string;
  duplicateHash: string;
};

type Runtime = { submissions: DemoSubmission[] };
const globalRuntime = globalThis as typeof globalThis & { __participationDemo?: Runtime };
const demoCounties = ['Nairobi', 'Nairobi', 'Nairobi', 'Nairobi', 'Nairobi', 'Nairobi', 'Mombasa', 'Mombasa', 'Mombasa', 'Mombasa', 'Mombasa', 'Kisumu'];
const seedSubmissions = (): DemoSubmission[] => opportunities.flatMap((opportunity) => Array.from({ length: opportunity.responseCount }, (_, index) => ({
  id: `demo-${opportunity.id}-${index}`,
  opportunityId: opportunity.id,
  reference: `DEMO-${opportunity.id.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
  county: opportunity.scope === 'county' ? opportunity.county : demoCounties[index % demoCounties.length],
  channel: index % 5 === 0 ? 'whatsapp_demo' as const : 'web' as const,
  freeText: index % 2 === 0 ? 'Jobs and education are good opportunities, but accountability is a challenge.' : 'Infrastructure and cost of living need support.',
  answers: [],
  submittedAt: new Date(Date.UTC(2026, 8, 1 + index)).toISOString(),
  duplicateHash: `seed-${opportunity.id}-${index}`,
})));
const runtime = globalRuntime.__participationDemo ??= { submissions: seedSubmissions() };

export function addDemoSubmission(input: Omit<DemoSubmission, 'id' | 'submittedAt'>) {
  if (runtime.submissions.some((submission) => submission.duplicateHash === input.duplicateHash)) return null;
  const submission = { ...input, id: crypto.randomUUID(), submittedAt: new Date().toISOString() };
  runtime.submissions.push(submission);
  return submission;
}

export function demoSubmissions(opportunityId?: string) {
  return opportunityId ? runtime.submissions.filter((item) => item.opportunityId === opportunityId) : [...runtime.submissions];
}

export function demoResults(opportunityId: string) {
  const opportunity = opportunities.find((item) => item.id === opportunityId);
  if (!opportunity) return null;
  const live = demoSubmissions(opportunityId);
  const byChannel = live.reduce<Record<string, number>>((all, item) => ({ ...all, [item.channel]: (all[item.channel] ?? 0) + 1 }), {});
  const countyCounts = live.reduce<Record<string, number>>((all, item) => item.county ? ({ ...all, [item.county]: (all[item.county] ?? 0) + 1 }) : all, {});
  const threshold = 5;
  const suppressed = Object.entries(countyCounts).filter(([, count]) => count < threshold).reduce((sum, [, count]) => sum + count, 0);
  const byCounty = Object.fromEntries(Object.entries(countyCounts).filter(([, count]) => count >= threshold));
  if (suppressed) byCounty['Suppressed / other'] = suppressed;
  const ai = new LocalDemoAiProvider();
  const texts = live.map((item) => item.freeText).filter((text): text is string => Boolean(text));
  const sentiment = texts.map((text) => ai.sentiment(text).label).reduce<Record<string, number>>((all, label) => ({ ...all, [label]: (all[label] ?? 0) + 1 }), { supportive: 0, skeptical: 0, mixed: 0, neutral: 0 });
  const clusters = ai.cluster(texts).map((cluster) => ({ label: cluster.label, size: cluster.memberIndexes.length }));
  const timeline = Object.entries(live.reduce<Record<string, number>>((all, item) => { const day = item.submittedAt.slice(0, 10); all[day] = (all[day] ?? 0) + 1; return all; }, {})).map(([date, count]) => ({ date, count }));
  return { totalDirectSubmissions: live.length, byChannel, byCounty, sentiment, clusters, timeline, socialMentionCount: seededSocial.filter((item) => item.opportunityId === opportunityId).length, minimumThreshold: threshold, officialResponse: { status: 'Awaiting response', institution: opportunity.institution, lastUpdated: null }, methodology: 'Runtime demo submissions only. Social mentions remain separate.' };
}

export function csvExport() {
  const safe = (value: unknown) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return ['reference,opportunity,county,channel,submitted_at', ...runtime.submissions.map((item) => [item.reference, item.opportunityId, item.county, item.channel, item.submittedAt].map(safe).join(','))].join('\n');
}
