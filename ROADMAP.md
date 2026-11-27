# Esquisse V0 Foundation

Proposed roadmap · 25 November 2026

Give a creator a budget and a shot to make. By the end of V0, they should be able to tell how many attempts they can afford, generate an image, download it and trace the cost. A contributor should be able to run the same release, inspect the calculation and influence what ships next.

The milestones below are ordered by what each one needs from the previous one. The first prototype is tracked in [issue #1](https://github.com/EsquisseHQ/studio/issues/1). The [founding manifesto](MANIFESTO.md) explains the longer-term vision.

| Milestone | Work | Ready to move on when |
| --- | --- | --- |
| 1. Choose the first shot and model | Invite creators to describe a shot they make repeatedly. Pick one use case and one image API with a documented price for the chosen settings, a downloadable result and a way to identify a submitted job. Record the choice, rate source and trade-offs in the issue. | A contributor can reproduce a sample quote from the published rate and explain which settings affect it. |
| 2. Ship the prototype | Run the interface locally and submit to the official Esquisse API. The API quotes the provider amount, studio fee, applicable tax and total before submission. Use test billing for the demo and identify who funds real provider calls. Let the creator download the image and its receipt. | A reviewer follows the setup guide from a clean checkout, downloads a real image and matches the receipt to the quote. An interrupted request can be checked without submitting a second paid job. Credentials stay out of logs and source control. Close issue #1 after this review. |
| 3. Test the public alpha | Invite five creators to try the budget exercise and one outside developer to trace the calculation. Give contributors a short guide for proposing an integration, reproducing a billing error and submitting a fix. | Record how many testers completed the exercise unaided, fix any unexplained charge and rerun the affected scenario. Publish at least one decision prompted by feedback, with its rationale and the contributor credited if they wish. |
| 4. Decide whether to open paid access | Show alpha testers a quote for their own shot using the same schedule for the local client and the website. Compare the value of model access, job recovery and support with the price they would actually pay. Cost the service using alpha data and a stated assumption for founder time. | Publish a go, revise or defer decision. Open a small paid pilot when creators opt in at that price, the service can honor its quotes and refunds, and the projected volume can cover operations and founder pay. Record the assumptions to check against real usage. |

## First playable demo

Start with a product photographer making a square packshot. Give them an editable example prompt, the model name, the format and a quote beside Generate. After the first attempt, let them change the lighting in the prompt and try again from the result. This tests whether someone can create **and iterate** in one sitting. The first implementation uses the deterministic test provider from the [engineering stack](STACK.md), labels its output and prices as simulated, and runs without a provider key.

| Work item | Evidence for review |
| --- | --- |
| Studio screen and quote | A reviewer can edit the prompt and see the provider amount, Esquisse fee and total before submitting. |
| Complete simulated run | From a clean checkout, a contributor can download a test image and its receipt, refresh the page, and recover the same attempt. A duplicate submission produces a single job. |
| First real model | Repeat the same exercise with one documented provider rate. Download the actual image, compare the receipt with the accepted quote, and check an interrupted request. |

## Tracking progress

### 27 November 2026 · First provider for the local trial

The local studio now includes an opt-in FLUX 1.1 [pro] adapter. The local test suite covers delivery, reload, a lost submit acknowledgement and provider refusal with mocked HTTP. The first funded call and comparison to the actual BFL account debit remain open.

The production build and all three simulator tests passed again. The prototype remains on the local `prototype/image-studio` branch. [Issue #1](https://github.com/EsquisseHQ/studio/issues/1) stays open until a reviewer downloads a real image and reconciles its receipt.

Use Black Forest Labs' FLUX 1.1 [pro] for the first integration trial. The starting shot is one 1024 × 1024 text-to-image perfume packshot. Its fixed per-image rate makes the quote easy to check. BFL lists this as a previous-generation model, so the trial selects it for predictable billing and makes no claim about which model the wider catalog should feature. [Provider pricing](https://bfl.ai/pricing) · [Model API](https://docs.bfl.ai/flux_models/flux_1_1_pro)

**Worked quote in USD.** One image at the published rate of $0.04 plus an illustrative $0.01 studio fee gives $0.05 before tax. Two separate attempts at the same rate and example fee would total $0.10 before tax. The fee is a test assumption. The simulator's existing EUR prices are separate fixtures.

**Next integration check.** Record the accepted quote and attempt before submitting. BFL returns an ID and polling URL. Persist both, then resume that job on refresh and save the returned image with its receipt. If BFL might have accepted a request but the acknowledgement was lost, flag the attempt for reconciliation and avoid resubmitting it. Exercise both interruption cases with simulated HTTP responses before the first funded call. [BFL generation and polling guide](https://docs.bfl.ai/quick_start/generating_images)

On 25 November 2026 the local simulation passed the production build and three automated checks, including a Chrome run that downloads the PNG and receipt and recovers the attempt after reload. The API checks cover concurrent acceptance, replay and invalid requests. The delivered slice uses the local SQLite store. Milestone 2 still requires a real model, provider job recovery and a clean-checkout review. Next, select one provider by reproducing a quote for the square packshot from its published rate.

Keep the four milestones above as the public overview. Use [issue #1](https://github.com/EsquisseHQ/studio/issues/1) for prototype acceptance. Open a linked issue for each work item as it enters development, with a user action and an observable completion condition. Link the implementation PR and its test or demo from that issue. At each milestone review, record what someone actually reproduced, what is blocked, and the next item to start. Leave issue #1 open until a reviewer reproduces a real generation.

## How the official studio could earn revenue

The founder operates the official generation API. A creator using the local interface gets the same fee schedule as a creator using the website. The official API issues the quote, holds the provider credentials and collects the service fee on billable generations. A third-party client can use this API on the same terms. Under MIT, an independent operator can also run a fork with its own provider contracts and billing. Running published code alone creates no royalty obligation.

For the pilot, test one visible service fee per generation. Show the provider amount, studio fee, applicable tax and final total before purchase. To evaluate the fee, deduct per-job operating and payment costs and an allowance for failed jobs or refunds. The remainder per job must cover fixed monthly costs, a budget for founder compensation and any agreed contributor payments. Track the surplus after those costs separately. Use that calculation and actual demand to choose an opening rate.

## Who decides during V0

Anyone can propose models, contribute code, review the fee calculation and run their own version under the [MIT license](LICENSE). The founder maintains the official releases and brand, operates the hosted service and makes the final V0 pricing and release decisions. Record significant proposals and their outcomes in public issues so contributors can see what changed and why.

When a contributor is ready to own an integration, propose a named scope and agree on maintenance and any compensation before assigning the work. A second model, video and any shared treasury each need a concrete use case and a separate decision after the foundation demo.
