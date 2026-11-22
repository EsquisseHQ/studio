# The Esquisse Manifesto

*A Cooperative Studio for Generative Media*

*Founding paper · Draft 0.1 · 22 November 2026*

## Abstract

A filmmaker has a budget for one more shot. She can judge whether a different model might give her a better take. She should also be able to tell whether she can afford three attempts. Answering that question requires a price she can read before she commits and a receipt she can check afterward. Building a studio she can depend on requires something further. She needs to know who can change that price, who maintains the software, and what choices she has if its direction changes.

We propose an open-source studio for generating images and video across multiple models, including proprietary models reached through their providers’ APIs. The studio would publish its pricing method, disclose what it retains on each generation, and release its own code under the MIT license from the outset. Creators and contributors would have a public route into decisions about the product. The founder would initially maintain the official release and brand. This paper describes how such a studio could earn its first users, pay for its upkeep, and share authority as its community grows.

## 1. The price of another take

Creative work proceeds by revision. A director changes the light, waits for the result, and tries the shot again. A still image that works as a composition may fail as the opening frame of a moving sequence. The relevant unit of purchase is often the *next attempt*. A monthly allowance tells the director little about that decision if she must first convert money into credits, credits into seconds, and seconds into different amounts for each model.

A studio could solve that problem with a small change at the point of use. When the director extends a shot from five seconds to ten, the price beside the generate button should change with it. When she switches models, she should see what that choice does to the same budget. If she comes back a week later, she should be able to understand why an otherwise identical shot costs more. A published rate history could tell her whether the provider changed its price or the studio changed its fee. Those are decisions made by different people, and she may have a reason to question either one.

## 2. What the studio builds

The studio is the software between a creator and a model provider. It takes a prompt and any reference material, exposes the settings that matter for the chosen model, obtains a quote, submits the job, and returns the output with its receipt. A common interface should preserve the differences that make a model worth choosing. A creator who picked a video model for its camera controls should find those controls in the studio.

The first useful release can be small. One person should be able to choose a model, understand the price, generate an image, and download it. A second integration would answer a different question. Can that person compare two models for the same task and make a meaningful choice? Each addition to the catalog should earn its place by giving a creator a capability, a price, or a quality of result they have reason to use.

One proposed starting point is to let users bring their own provider keys. The provider would then bill the creator directly, allowing the project to test the workflow without financing everyone’s generations. In that mode the interface should identify who will bill the user and label any provider charge it can only estimate. A hosted service selling generations on its own account would take on a different responsibility. It would have to stand behind the price it offers.

## 3. From a quote to a receipt

Consider a hypothetical hosted generation priced in euros. The provider charges €0.40 for the selected job. The studio adds a €0.10 service fee. With taxes omitted for this example, the creator authorizes €0.50. The fee is 25 percent of the provider charge and 20 percent of the quoted total. Both percentages describe the same transaction. Publishing the two amounts removes the ambiguity. The studio retains ten cents before it pays its own expenses. Its profit can only be determined after those expenses are accounted for.

For a fixed-price job, we propose that the quote record the provider, model, billable settings, provider charge, studio fee, any applicable tax, and final amount and currency. Accepting it should bind that job to those terms. If the rate changes before an expired quote is accepted, the creator gets a new quote to review. If a provider bills by metered usage, the interface should show the unit rate, an estimate, and the maximum the user authorizes. A hosted integration should offer that kind of job only when the studio can honor the cap, including by absorbing an overrun.

The receipt closes the loop. It should identify the accepted quote, state whether an output was delivered, and show the amount charged or refunded. Suppose a provider accepts a job and the connection drops before the studio receives confirmation. A second click should retrieve the pending job while its status is resolved. Quietly submitting another paid generation would make the price on the button meaningless. The same principle applies to failures. Creators should see the charging rule before submitting a job and the outcome of that rule on the receipt.

## 4. What makes a fee fair

A useful studio costs money to keep running. Someone maintains integrations when a provider changes its API, investigates jobs that disappear, answers billing questions, and keeps yesterday’s projects usable. The people doing that work deserve compensation. An artificially low fee can leave them subsidizing the service with unpaid evenings.

Our proposal is to make the fee accountable. Publish the schedule and its effective date. Explain what a change is intended to pay for. If a volume discount lowers what the studio pays upstream, describe how it affects the customer price and the amount the studio retains. Where the effective cost becomes known only at the end of a billing period, distinguish the reference rate used in the quote from the later discount. A creator reading the word “cost” should be able to tell which figure it means.

We leave the opening fee and its future level open. A percentage that sounds fair in a founding paper could prove wasteful at scale or insufficient at launch. Evidence worth bringing to that decision includes the cost of maintaining the service, what creators pay in practice, and whether contributors can afford to keep working on it.

## 5. The right to leave

Imagine that, two years after launch, a group of animators needs a workflow the official maintainers decline to support. Under the MIT license, they could take the released studio code, adapt it, and run their own version. That freedom matters even to creators who never exercise it. It gives a disagreement about the product somewhere productive to go.

The commitment covers the software the project authors. A third-party model remains subject to its provider’s terms, prices, and availability. A fork still needs a way to access that model. The founder will steward the official releases and project brand so users can identify the distribution maintained here. Other maintainers can build a different service from the shared code under their own identity.

There is also a quieter form of exit. A filmmaker may simply want to move a shot to another tool. A useful export would include the media and, where available, its model identifier, prompt, settings, and references the creator can retain. These details let another person understand how the shot was made, even when the original model can no longer reproduce it.

## 6. Who decides

At launch the founder is responsible for what ships in the official studio. Calling the project cooperative creates an obligation to explain where others can already exercise influence and where authority still rests with one person. The first practical mechanism we propose is a public decision record. A creator can request an integration, describe the work it would enable, and receive an answer others can read. A maintainer can accept it, defer it with a reason, or invite someone to contribute it.

Consider two proposals competing for a month of development. One adds a popular video model. The other fixes failed jobs that leave customers uncertain whether they were charged. A vote count alone tells maintainers little about the cost of the second problem to the people experiencing it. A decision record can bring together examples from creators, an estimate from the maintainers, and the reason for the final choice. Future contributors can reopen the decision when the evidence changes.

As participation grows, specific powers can be transferred. Contributors might first take responsibility for individual integrations. Creators and maintainers might later decide together how to spend an agreed development budget or revise the fee schedule. Each transfer should identify the decision being delegated, who can participate, how a result takes effect, and who is accountable for carrying it out. Until such a transfer occurs, the public record should name the person who actually decides.

## 7. The place of a public ledger

A ledger becomes relevant when several parties need a common record and have a concrete reason to verify it independently. A future community treasury is one possible application. Members might wish to check that an approved payment reached its destination. Even then, the transaction alone cannot tell them whether the work was delivered or whether the recipient was chosen fairly. Those questions still require people, evidence, and rules they understand.

Kaspa is a candidate for that later investigation. A proposal to use it should name the decision or transaction it improves, what members would have to trust, what participation would cost, and what happens if the network or an integration becomes unavailable. Creating an image in the initial studio requires neither a wallet nor a studio token. Questions of issuance, voting weight, and treasury rights remain open. The existence of a user base would give us people with whom to answer them.

## 8. The first proof

The first public demonstration should fit into a single sitting. Give a creator a small budget and a shot they want to make. Before they click, ask how many attempts they can afford and who receives the money. Afterward, ask them to find the image, match the charge to the quote, and explain a difference if one occurred. Then give the same release to a developer outside the project and ask them to trace the fee calculation in the published code. Each failure tells us something specific to fix.

The cooperative claim takes longer to test. Its first evidence might be a model that ships because a working creator made the case for it. Stronger evidence would be a decision about money that members had the authority to make and that the official service carried out. The distance between those two events is the work ahead.

We begin with a studio a creator can use, a price they can check, and code they can take with them. If people choose to build on it, they should be able to look back through its releases and decisions and see exactly when, and how, it became theirs to shape.
