# Working on Esquisse

Start with [open tasks](https://github.com/EsquisseHQ/studio/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22). Pick one with a reproducible outcome. Coordinate through the issue and submit a pull request as described in [CONTRIBUTING.md](CONTRIBUTING.md).

## Run and verify

Use Node.js 24 LTS and the pnpm version pinned in `package.json`. Run from the repository root.

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

For interactive changes, `pnpm dev` starts the local studio. The simulator runs with zero provider credentials and zero charges. Playwright starts its own production server with an isolated SQLite directory. On Linux hosts missing browser libraries, use `pnpm exec playwright install --with-deps chromium` during environment setup.

## Find the relevant code

| Change | Start here |
| --- | --- |
| Prompt, format picker, result actions | `app/image/page.tsx` and `app/studio.css` |
| Quote calculation, storage, replay | `lib/server.ts` |
| Request validation and downloads | `app/api/studio/[action]/route.ts` |
| Shared quote and receipt fields | `lib/types.ts` |
| Browser flow and duplicate-request checks | `tests/demo.spec.ts` |

For pricing changes, verify the receipt against the accepted server quote. Replaying an accepted request must return the same job. For UI changes, check the creator-facing interaction in French. Describe any untested behavior in the PR so the maintainer can reproduce it.
