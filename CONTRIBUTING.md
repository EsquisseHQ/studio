# Contributing to Esquisse

## Suggest a feature

Open an [issue](https://github.com/EsquisseHQ/studio/issues/new/choose) describing who needs the feature, what they are trying to do and what a successful result looks like. For example, a creator might want to copy the original prompt from a finished render after editing the text in the composer.

## Pick a task

The maintainer marks scoped tasks open for implementation with **help wanted**. **good first issue** identifies work suitable for someone new to the repo. Use the [open task list](https://github.com/EsquisseHQ/studio/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22). When the list is empty, propose an idea or ask about a milestone in the [roadmap](ROADMAP.md).

Check the issue's assignee, comments and linked PRs before starting. If it is available, leave a short comment describing what you are picking up so other contributors can coordinate. On a scoped task you can start immediately. An issue whose scope is still being discussed is a good place to offer examples or suggest acceptance criteria.

## Submit your work

1. Fork the repository and create a branch from the issue's target branch (normally `main`).
2. Follow the [developer setup](#developer-setup) and reproduce the behavior described in the issue.
3. Implement the change and check the observable result. For a visual change, include a screenshot or short recording that shows the interaction.
4. Open a pull request against the target branch. Link the issue, state which checks you ran and give the maintainer a quick way to try the result. Further pushes to your branch update the same PR.

The founder reviews contributions for the official studio and decides whether to merge, request changes or close the PR. Marking a task **help wanted** invites implementation and leaves that final decision open.

## Developer setup

Use Node.js 24 LTS or newer and pnpm 11.25.0. From the repository root run:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the loopback address printed by Next.js. Edit the sample prompt, choose a format and review the quote beside the generation button. Generate a variation and download the PNG and receipt. Reload the page to recover the last attempt in this browser. The receipt references the accepted quote and lists the amount actually charged in cents.

The studio uses SQLite in `.esquisse/` and binds to loopback for single-user access. Set `ESQUISSE_DATA_DIR` to choose a separate data directory. The simulator needs no account, provider key or Docker daemon. See [quote and attempt storage](lib/server.ts) and [BFL submission and polling](lib/bfl.ts).

### Try FLUX with your own BFL account

Copy `.env.example` to `.env.local` in the repository root and set `BFL_API_KEY` there. Restart the local server. Select **FLUX 1.1 [pro]** to see the USD quote. Only the Generate button submits a new paid request. One square 1024 × 1024 image has a published provider price of **$0.04**. The key owner's BFL account pays the provider. The prototype shows an illustrative **$0.01** studio fee and collects **$0.00**. The receipt records the provider quote, BFL request ID and amount collected by Esquisse. The BFL account statement is the source for the actual provider debit. [Provider pricing](https://bfl.ai/pricing)

Keep the page open through delivery or return promptly to resume polling. BFL's signed download links expire after ten minutes. An attempt with a saved provider ID resumes on reload. If BFL may have accepted a request and the acknowledgement was lost, the studio reports that it needs checking. Check the BFL account before deliberately starting a fresh attempt. [Generation and delivery](https://docs.bfl.ai/quick_start/generating_images)

To verify the demo, run `pnpm build`, `pnpm exec playwright install chromium` and `pnpm test:e2e`. The tests start a separate server with an isolated SQLite directory. To use an existing Chrome installation, set `PLAYWRIGHT_CHANNEL=chrome` instead of downloading Chromium.
