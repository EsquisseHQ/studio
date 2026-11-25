# Contributing to Esquisse

## Suggest a feature

Open an [issue](https://github.com/EsquisseHQ/studio/issues/new/choose) describing who needs the feature, what they are trying to do and what a successful result looks like. For example, a creator might want to copy the original prompt from a finished render after editing the text in the composer.

## Pick a task

The maintainer marks scoped tasks open for implementation with **help wanted**. **good first issue** identifies work suitable for someone new to the repo. Use the [open task list](https://github.com/EsquisseHQ/studio/issues?q=is%3Aissue%20is%3Aopen%20label%3A%22help%20wanted%22). When the list is empty, propose an idea or ask about a milestone in the [roadmap](ROADMAP.md).

Check the issue's assignee, comments and linked PRs before starting. If it is available, leave a short comment describing what you are picking up so other contributors can coordinate. On a scoped task you can start immediately. An issue whose scope is still being discussed is a good place to offer examples or suggest acceptance criteria.

## Submit your work

1. Fork the repository and create a branch from the issue's target branch (normally `main`).
2. Follow the [local setup](README.md#run-the-local-studio) and reproduce the behavior described in the issue.
3. Implement the change and check the observable result. For a visual change, include a screenshot or short recording that shows the interaction.
4. Open a pull request against the target branch. Link the issue, state which checks you ran and give the maintainer a quick way to try the result. Further pushes to your branch update the same PR.

The founder reviews contributions for the official studio and decides whether to merge, request changes or close the PR. Marking a task **help wanted** invites implementation and leaves that final decision open.
