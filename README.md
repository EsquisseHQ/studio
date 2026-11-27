<p align="center"><img src="./esquisse-logo.png" alt="Esquisse" width="112"></p>

# Esquisse

Esquisse is a cooperative, open-source studio in development for generating images and video across multiple AI models. Before a creator starts a generation, they should be able to see what the provider charges, what the studio retains, and how much they will pay.

## Project status

The home page explains the breakdown of generation costs. The Image studio opens in a free simulation that varies the lighting and crop of a perfume photograph. The model menu also offers an optional FLUX 1.1 [pro] API trial. Successful attempts save a PNG and a JSON receipt linked to the accepted quote. [Roadmap](ROADMAP.md) · [Engineering stack](STACK.md) · [First real generation](https://github.com/EsquisseHQ/studio/issues/1).

## Run the local studio

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

## Help shape the studio

Developers and coding agents are welcome. Browse [open tasks marked help wanted](https://github.com/EsquisseHQ/studio/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22), or [propose a feature](https://github.com/EsquisseHQ/studio/issues/new/choose). The [contribution guide](CONTRIBUTING.md) covers taking a task and getting your work reviewed. Coding agents can start with [AGENTS.md](AGENTS.md).

Read [The Esquisse Manifesto](MANIFESTO.md) for the pricing and governance proposals. To suggest an integration, [open an issue](../../issues/new) describing what you want to create, which model you use, and what you need to know before paying for a generation. The founder maintains the official releases during this first phase.

## License

Esquisse's code is released under the [MIT License](LICENSE). Integrated models and provider APIs have their own terms.
