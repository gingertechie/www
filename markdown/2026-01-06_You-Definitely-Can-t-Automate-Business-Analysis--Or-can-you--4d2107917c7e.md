# You Definitely Can’t Automate Business Analysis. Or can you?

The Accidental Ontologist: How I Stopped Interviewing People About Procure-to-Pay

---

### You Definitely Can’t Automate Business Analysis. Or can you?

### The Accidental Ontologist: How I Stopped Interviewing People About Procure-to-Pay

*Or: What happens when you realise most businesses are just variations on a theme*

---

I have a confession. For years, I’ve been sitting in meeting rooms listening to people explain their business processes to me. Earnest people. Smart people. People who would spend forty-five minutes describing, with increasingly elaborate hand gestures, what turned out to be… accounts payable.

“So we receive the invoice,” they’d say, warming to their subject. “And then Margaret checks it against the PO — that’s Purchase Order — and if it matches, she puts it in the system. But sometimes it doesn’t match, and then…”

And I’d nod, and take notes, and draw boxes on whiteboards, and slowly die inside. Because I’d heard this exact process described a hundred different ways, each person convinced their version was somehow unique.

It isn’t. It’s procure-to-pay. It’s been procure-to-pay since roughly the invention of money. I was reminded of this by a colleague I worked with last year and it really changed my thinking. Thank you!

This is the story of how I went looking for a better way — and fell down a rabbit hole of business process frameworks, accounting ontologies, and semantic web standards that I’m still climbing out of.

---

### The Hypothesis

I’m a product manager slash business analyst slash fixer-upper. I get parachuted into companies — usually under 250 staff, often much smaller — to catalyse major change. Tech modernisation, efficiency improvements, competitive transformation. My engagements typically last 20–30 days, and my outputs feed into development teams who need clear, comprehensive specifications to build from.

The problem: most of those 20–30 days were spent in discovery. Interviewing people. Mapping processes. Documenting the current state. And I couldn’t shake the feeling that I was reinventing the wheel every single time.

Because here’s the thing — most businesses aren’t special. I don’t mean that unkindly. I mean that structurally, operationally, a pension broker in Dublin and a pension broker in Sydney are doing basically the same things. They’re regulated intermediaries connecting customers to financial products. They have lead funnels, advisory processes, compliance requirements, commission structures. The details vary. The skeleton doesn’t.

What if I could start with the skeleton?

What if, instead of spending two weeks asking people to describe their processes from scratch, I could show up with a template and say: “Here’s how businesses like yours typically work. Tell me where you’re different.”

That was the hypothesis. Simple enough. Finding the skeleton turned out to be… less simple.

---

### The REA Detour

My first stop was REA — Resources, Events, Agents. It’s an accounting ontology developed in the 1980s by William McCarthy, originally for modelling economic exchanges in databases.

The idea is elegant: every business transaction involves resources flowing between agents, triggered by events. Buy something? Cash (resource) flows from you (agent) to supplier (agent) via a purchase event. Sell something? Product flows out, cash flows in. REA gives you a clean way to decompose any business into its fundamental exchanges.

I was excited. This felt rigorous. Formal. The kind of thing that would let me walk into any business and immediately understand its economic skeleton.

Then I tried to use it.

I was mapping a fintech client’s customer journey, and I hit a wall almost immediately. REA could beautifully describe the moment of transaction — customer signs up, money changes hands, service is provisioned. Perfect.

But what about everything before that?

Lead nurturing. The marketing funnel. Content that builds trust. The “clarity call” where someone explains your options. All the persuasion and education and relationship-building that happens before any economic exchange occurs. REA had nothing to say about it. The entire customer acquisition journey was invisible.

REA isn’t wrong. It’s just incomplete. It was designed to model accounting systems, and accounting only cares about what happens when resources actually move. But as a business analyst, I care about everything that leads up to that moment — and everything that follows.

I needed something bigger.

---

### Finding APQC

Enter the APQC Process Classification Framework.

APQC — the American Productivity & Quality Center — has spent decades cataloguing what businesses actually do. Their framework breaks it down into twelve categories:

1. Develop Vision and Strategy
2. Develop and Manage Products and Services
3. Market and Sell Products and Services
4. Deliver Physical Products
5. Deliver Services
6. Manage Customer Service
7. Develop and Manage Human Capital
8. Manage Financial Resources
9. Acquire, Construct, and Manage Assets
10. Manage Enterprise Risk, Compliance, and Resiliency
11. Manage External Relationships
12. Develop and Manage Business Capabilities

Each category breaks down into processes, and processes into activities. The full framework has over 1,500 distinct process elements. It’s… comprehensive.

And crucially, it covers the whole business — not just the transactions. Marketing. HR. Compliance. Strategy. All the human, messy, non-transactional stuff that REA ignores.

This was the skeleton I’d been looking for.

---

### Building the Archetypes

A framework is just a framework. The real work is applying it.

I started building what I call “archetypes” — pre-mapped templates for specific business types. A B2B SaaS company. A regulated pension broker. An online student travel agency. For each archetype, I mapped all twelve APQC categories, noting which processes were core versus supporting, which were commonly absent, which had regulatory requirements attached.

The B2B SaaS archetype looks different from the pension broker archetype. SaaS companies have minimal physical delivery (Category 4.0 is basically empty) but heavy product development (Category 2.0). Pension brokers have light product development (they’re distributing other companies’ products) but heavy compliance (Category 10.0 is core, not supporting).

For each archetype, I documented:

* **Variation points**: Where do businesses of this type typically differ from each other? Pricing models? Geographic scope? Regulatory status?
* **Technology stacks**: What systems typically support each process area? CRM for sales, billing systems for revenue, compliance tools for regulated industries?
* **Red flags**: What processes are commonly missing that really shouldn’t be? (Spoiler: formal performance management and vendor contract tracking. Every time.)
* **Interview guides**: What questions reveal the actual variation points, rather than restating the obvious?

The goal was to flip the discovery process. Instead of “tell me about your business,” it’s “here’s how businesses like yours typically work — where are you different?”

---

### The AI Acceleration

Here’s where it gets interesting.

I’m building these archetypes not just for my own use, but to feed into AI-assisted workflows. When the development team I’m handing off to is using AI coding assistants, the quality of my specification documents matters enormously. Garbage in, garbage out. Vague requirements produce vague implementations.

So I started building prompts. Not throwaway prompts — structured, repeatable prompts that take a business description as input and produce a full APQC mapping as output.

The prompt enforces a clarification protocol. Before generating any analysis, it asks specific questions about ambiguities, gaps, or contradictions. “You mentioned commission income but didn’t specify whether this is initial commission, trail commission, or both — which applies?” Only after clarification does it proceed.

The output follows a consistent structure: archetype definition, characteristics comparison, all twelve APQC categories with relevance ratings, technology stack mapping, variation points, interview guides. Every engagement, same format. Clients can compare their analysis to prior archetypes. Development teams know exactly what they’re getting.

I tested it on a recent client engagement. I fed in basic information about their business — just what I learned from the few hours of discussions.

What I got back was a comprehensive breakdown. All twelve categories mapped. Regulatory requirements flagged. Technology gaps identified. Pain points surfaced — the analysis correctly inferred that one process was “almost entirely human, subjective, uneven, unauditable and incredibly manually intensive” (which, when I actually talked to them, turned out to be exactly right).

More importantly, I got a todo list. Every sub-category I didn’t know about yet was flagged for investigation. Instead of vague “understand the business” scoping, I had specific questions for specific process areas.

---

### What REA Is Actually Good For

Remember REA, the accounting ontology I abandoned early on? It turns out I gave up too soon.

REA isn’t useful for mapping an entire business. But it’s extremely useful for one specific task: understanding multi-party transactions.

Take a pension broker. The customer doesn’t pay the broker. The customer pays the pension provider. The provider pays the broker a commission. It’s a three-party exchange, and if you don’t understand who’s giving what to whom, you’ll misunderstand the entire business model.

REA forces you to be explicit:

This table takes two minutes to complete and prevents hours of confusion later. “Wait, so the customer doesn’t pay you? Then who does? And when?”

REA is a validation tool, not a scaffolding framework. Use it to sanity-check your understanding of the commercial model, then move on to APQC for everything else.

---

### The Deeper Rabbit Hole

Once you start looking at business process frameworks, you realise there’s a whole ecosystem down there. I needed a map.

What helped me was understanding that these frameworks exist at different layers — they’re not competing, they’re complementary. Here’s the landscape (as I currently understand it):

This was genuinely clarifying. I’d been confused about whether BPMN was an alternative to APQC (it isn’t — they operate at different layers). I’d been unsure where REA fit (ontology layer — useful for validation, not scaffolding). The stack made sense of the territory.

Within the process classification layer itself, APQC isn’t the only option:

The decision tree I use now:

* Telecom client? → **eTOM**
* Bank or building banking software? → **BIAN** (overlay on APQC)
* Supply chain is the core business? → **SCOR** for delivery processes, APQC for everything else
* Everyone else? → **APQC**

For my typical clients — SMEs under 250 staff, often fintech or professional services — APQC wins. It’s universal enough to apply, granular enough to be useful, and doesn’t require industry-specific expertise to interpret.

The complementary standards then layer on top:

* **BPMN** tells you *how* a specific process works (flowcharts with semantics)
* **DMN** captures the business rules within that process (decision tables)
* **EARS** gives you syntax for writing requirements precisely enough that a developer — or an AI — can implement them unambiguously

A typical engagement might use APQC to identify scope, BPMN to model current/future state, DMN to capture complex eligibility rules, and EARS to write the actual requirements.

And beyond all of this? The semantic web crowd. OWL ontologies. Knowledge graphs. People trying to formally represent all business knowledge in machine-readable formats. I haven’t gone there yet. I’m not sure I need to. But it’s good to know the territory exists — and that what I’m doing with APQC archetypes is, in some sense, a pragmatic approximation of what they’re trying to achieve formally.

---

### Where I Am Now

I’m starting a second engagement with a client later this week — a specific program to address their operational pain points. And before we write a single line of code, I’m going to use the APQC framework to fully map the business. Not because I enjoy frameworks, but because both I and the client need to see the whole picture before we start changing pieces of it.

The methodology is built. The prompts are written. The archetypes exist. Now comes the real test: applying it systematically to a live engagement.

---

### The Invitation

This approach isn’t finished. It’s not a product. It’s a methodology in development, being refined through actual use.

If you’re a business analyst tired of asking the same discovery questions in every engagement — I’d love to hear from you.

If you’ve used APQC, BPMN, or EARS in anger and have opinions — I’d love to hear from you.

If you think I’ve missed something obvious, or you’re working on similar problems from a different angle — I’d *definitely* love to hear from you.

The whole point of building on standard frameworks is that they’re *standard*. Shared vocabulary. Cumulative knowledge. We don’t all need to independently rediscover that most businesses have accounts payable processes.

Comment, suggest, remix. The framework is there to be used.

---

*Dave is a business analyst and product manager specialising in organisational transformation for companies under 250 staff. He remains irrationally fond of BPMN diagrams.*

By [Dave Anderson](https://medium.com/%40dave_29498) on [January 6, 2026](https://medium.com/p/4d2107917c7e).

[Canonical link](https://medium.com/%40dave_29498/you-definitely-cant-automate-business-analysis-or-can-you-4d2107917c7e)

Exported from [Medium](https://medium.com) on February 12, 2026.