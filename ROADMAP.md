# V0.01 — Foundation

Build an open-source creative web studio where you can bring your own provider API key, see the estimated cost of a generation, and download the result.

## What you can try today

The [Image Studio demo](https://esquisse.top/image) simulates a generation using a sample photograph. You can review a quote, change the lighting or crop, and download the image and its receipt. The demo is free to explore without a provider key. The first live image trial is tracked in [issue #1](https://github.com/EsquisseHQ/studio/issues/1).

## What we’re building

| Area | Foundation milestone |
| --- | --- |
| Studio & Models | Move between Image, Audio and Video in one web app. Browse the model catalog and see which models you can use with your provider key. |
| Media generation | Generate and download a real image, an audio file and a short video. For audio, we want to explore voice, sound effects and music. Provider trials will help us choose where to start. |
| Providers & Pricing | Compare providers through hands-on trials. Before you generate, see who bills you, the estimated total and any Esquisse fee. We’ll decide when to introduce a fee once we understand the costs. |
| Accounts | Create an account and sign back in. |
| MCP | Deliver a first working Model Context Protocol (MCP) integration. Choose its first supported action during development. |

## How we’ll test the foundation

A tester brings compatible provider keys and tries one image, one audio clip and one short video. For each attempt, they can see the estimate before submitting, run the generation and download the resulting file. We’ll also check the account flow and demonstrate the first MCP action. After those trials, we’ll decide when to open live generation to the public.

The order of the work stays flexible as we learn from the prototype. To follow or pick up a task, see the [open issues](https://github.com/EsquisseHQ/studio/issues). To suggest a use case for a model or provider, [share it in Discussions](https://github.com/EsquisseHQ/studio/discussions).

[Developer setup and provider trial](CONTRIBUTING.md#developer-setup) · [Engineering stack](STACK.md) · [Earlier image prototype notes](https://github.com/EsquisseHQ/studio/blob/037fa83569ccfc4b27fefeb5eb3fdb9f8df231f4/ROADMAP.md#first-playable-demo)
