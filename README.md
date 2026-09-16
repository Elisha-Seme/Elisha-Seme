# Kiongozi Public Participation

A Next.js 15, TypeScript, Tailwind and Supabase civic participation application. Citizens can discover Kenyan consultations, read plain-language analysis, respond anonymously, and inspect privacy-preserving results. Social pulse content is explicitly separate from formal submissions.

## Local setup

1. Copy `.env.example` to `.env.local` and provide a Supabase project URL and keys.
2. Run `npm install`, `supabase db reset` (or apply `supabase/migrations` in timestamp order), then `npm run dev`.
3. Visit `/participation`. The checked-in demo catalogue remains available when Supabase is not configured. Anonymous demo responses are retained in the running Node.js process, update the results dashboard immediately, and reset on restart; apply the migration and replace the runtime repository before collecting real responses.

## Authentication and roles

Admin APIs use Supabase Auth bearer/cookie sessions and the existing convention of an `app_metadata.role` value of `admin` or `moderator`. Set that claim with trusted server-side Supabase administration tooling; never permit users to edit it. Moderators can review flags; admin is required for analysis and settings changes.

## Analysis, messaging, and social sources

`src/lib/participation/ai` contains the deterministic local provider. It summarizes paragraph text with references, uses a multilingual heuristic sentiment lexicon, clusters keyword overlap, and only recommends human moderation. Replace the `AiProvider` implementation to connect an approved external provider; no key is required in local mode.

The browser WhatsApp flow is a simulator. Implement the `MessagingProvider` interface and a verified webhook for Twilio, Africa's Talking, or another approved provider before production use. Approved public social sources should be imported via bounded CSV/JSON admin workflows with provenance; private messages and groups must never be imported.

## Demo data

The migration seeds three visibly labelled demo opportunities, related questions, a public social mention, a cluster, and tracker records. The runnable application additionally seeds direct responses in its process-local demo repository so submissions, duplicate detection, aggregation, threshold suppression, and CSV generation can be demonstrated without credentials. Demo values are not real public opinion and must be replaced with verified live data.

## Production security warnings

Apply and verify RLS before launch. Rotate service keys, set a strong `PARTICIPATION_HASH_SECRET`, configure trusted origins and platform rate limiting, review retention and residency with the appointed custodian, complete legal review, and verify backups/deletion. Service-role keys are server-only. Raw submissions must never be exposed publicly. All production import sources and official-response links require human verification.
