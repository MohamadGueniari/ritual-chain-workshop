# Reflection — Blind Cargo Judge

**Prompt:** *What should be public, what should stay hidden, and what should be
decided by AI versus by a human in a bounty system?*

---

**Public.** The manifest is paperwork everyone should be able to read: the brief,
the rubric, the prize, the two cutoffs, and the barcode of every sealed
container. A bounty is only trustworthy if the rules and the set of entries can
be audited after the fact.

**Hidden.** The cargo contents must stay sealed while loading is open. The moment
an answer is readable before the cutoff, a latecomer can crack open the best idea
in transit, append a line, and walk off with the prize — the exact unfairness
this system exists to stop. After customs closes the contents can open publicly
(commit-reveal), or stay encrypted and be inspected privately in a TEE when the
job demands it.

**Decided by AI.** Reading every opened container at once and ranking them
against the rubric is heavy, repetitive, consistency-sensitive work — a batch job
the machine should own. So the AI runs the inspection.

**Decided by a human.** The AI only recommends. Models can be prompt-injected,
can invent scores, and answer to no one when money moves. The host signs the
release manifest and pays — a person who can reject a gamed verdict, check it
against the rubric, and stand behind the result.

In one line: publish the paperwork, seal the cargo until customs, let the AI
inspect the batch, and let a human sign the release.
