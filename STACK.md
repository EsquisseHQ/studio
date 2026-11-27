# Esquisse V0 · Proposed engineering stack

TypeScript, Next.js and PostgreSQL form the core. The local interface and the official website are two clients of the same generation API. The founder operates that API and sets its fee schedule. The published source remains under the [MIT license](LICENSE). The first release targets [one real image and a traceable price](https://github.com/EsquisseHQ/studio/issues/1).

## Components and timing

| Layer | Choice | Responsibility | First needed |
| --- | --- | --- | --- |
| Repository and runtime | One GitHub repository, pnpm workspaces, Node.js LTS, strict TypeScript | Share contracts, price calculations and provider integrations. Pin runtime, package manager and dependency lockfile at bootstrap. | Prototype |
| Studio interface | React, Next.js App Router, Tailwind CSS, native HTML controls | Enter a prompt, edit billable settings, inspect a quote, follow progress, download an image and its receipt. Include keyboard navigation, focus and accessible status messages. | Prototype |
| Official API | Next.js Node route handlers, JSON over HTTPS, Zod schemas | Issue expiring quotes, accept a quote, start or retrieve a job and authorize downloads. Validate and calculate all billable fields on the server. Keep the public API contract versioned. | Prototype |
| Persistence | PostgreSQL, Drizzle ORM, reviewed SQL migrations | Store model and rate versions, accepted quotes, generation attempts, provider references and receipts. Use fixed-precision decimals for provider rates and integer minor units for customer settlements, with explicit currency and rounding. | Prototype |
| Model integrations | A typed module per provider, using its official HTTP API or SDK | Declare model-specific billable settings and translate submit, status, result and error responses. Include a deterministic fake provider for contributors and CI. Choose the first real API after checking pricing, delivery, job recovery and commercial terms. | Prototype |
| Background execution | Separate Node worker, pg-boss on PostgreSQL, client status polling | Persist a request before submission, execute jobs outside the web request and recover pending work after restart. Keep the provider request ID and an Esquisse idempotency key. | First real generation |
| Image storage | Filesystem volume for an isolated development instance, private S3-compatible object storage on the shared service | Copy completed media into storage controlled by the instance. Store object keys and content metadata in PostgreSQL. Issue short-lived download links after checking ownership. A local client of the official API downloads from the official service. | Prototype, then shared alpha |
| Accounts and API access | Better Auth with database sessions for the website, scoped revocable Esquisse API keys for local clients | Attribute jobs and charges to one account across clients. Store only key hashes on the service. Keep the local key on the local server side, and provider credentials only on the generation service. | Scoped test access for prototype, user accounts for alpha |
| Checkout and accounting | Stripe Checkout, verified webhooks, PostgreSQL transaction ledger | Proposed pilot uses prepaid amounts displayed in currency. Record a payment once, reserve the quoted amount per job, then settle or release it under the published failure policy. Track chargebacks and refunds against the original payment. | Test accounting in prototype, real collection at paid pilot |
| Tests and review | Vitest, Playwright, TypeScript checks, ESLint, Prettier and GitHub Actions | Test prices, rounding, quote expiry, duplicate requests and failure settlement. Run an end-to-end generation with the fake provider on pull requests. Keep a real provider smoke test opt-in and budgeted. | Prototype |
| Packaging and deployment | Dockerfiles, Docker Compose, a Linux host with Caddy and HTTPS for the official service | Run the web/API and worker separately from the same release. Provide a local client configuration and a full development setup. Use staging, controlled migrations and tagged releases for the shared service. | Compose in prototype, staging before alpha |
| Operations and maintenance | Pino structured logs, request and job IDs, health checks, PostgreSQL backups and object retention rules | Track queue age, provider failures, unreconciled jobs, fee revenue and cost per delivered generation. Redact keys and prompts from routine logs. Verify a restore and alert on billing discrepancies before charging creators. | Logs in prototype, alerts and restores before paid pilot |

## One generation

1. Either client sends the model and settings to the official API. The API returns a quote ID, rate version, provider amount, Esquisse fee, applicable tax, total, currency and expiry. A simulated payment is clearly identified in development.
2. The creator accepts the quote. The API checks account ownership, expiry and funds, then atomically reserves the amount, records the attempt and schedules the work in PostgreSQL. Duplicate acceptance returns the existing attempt.
3. The worker submits using the provider's idempotency mechanism where available. If the connection drops after a possible submission, it recovers the original request by reference or marks it for reconciliation. An ambiguous response must never trigger a blind paid resubmission.
4. On delivery, the worker saves the media, settles the reservation once and records the receipt. The client can reload and recover both artifacts. The receipt references the accepted quote, outcome and actual customer charge. Reconcile the provider's invoice separately to measure the realized margin.

The same published schedule applies when a fork calls the official API. An operator who runs the full stack independently supplies their own provider credentials, pays their provider and sets their own prices. The official service's credentials, payments account and customer records belong to its operator.

## How contributors can work locally

Start the full development stack with Docker Compose, PostgreSQL, a filesystem volume and the fake provider. This exercises quoting, simulated billing, generation, failure recovery and receipts without a paid account. A tester who needs a real official job can instead run just the local studio, configure an Esquisse API key and accept the same quote as on the website.

## Implementation order

1. **Foundation.** Bootstrap the workspace, client, API, migrations and CI. Deliver the fake-provider flow end to end, including a visible Esquisse fee, downloadable test output and a simulated receipt.
2. **Real generation.** Integrate one provider, start the worker, preserve real images and prove the timeout and duplicate-click scenarios. Document which account pays for real test calls and compare local and web quotes for identical inputs.
3. **Community alpha.** Add account isolation, scoped keys, private downloads, staging and contribution instructions. Invite an outside developer to add a fake model or trace a receipt from a clean checkout.
4. **Paid pilot.** Confirm the provider permits the commercial integration. Set the fee from measured costs, decide the payment and refund terms, exercise checkout in test mode, reconcile the ledger, restore a backup, then enable live billing.

The first provider, service fee, payment provider account, deployment vendor and exact dependency versions are implementation decisions. Video can reuse the job and receipt contracts once an image integration proves them.

Technical references include [Next.js deployment](https://nextjs.org/docs/app/getting-started/deploying), [Drizzle with PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql), [pg-boss](https://github.com/timgit/pg-boss), [Better Auth for Next.js](https://better-auth.com/docs/integrations/next), [S3 signed downloads](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) and [Stripe payment fulfillment](https://docs.stripe.com/checkout/fulfillment).
