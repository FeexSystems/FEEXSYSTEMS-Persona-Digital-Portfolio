# Model-Backed Intelligence: Why the LLM Must Not Become the World Model

**Published:** September 2026  
**Series:** Model-Backed Intelligence  
**Reading Time:** 12 min  
**Status:** Phase III-E architecture

## The central rule

The most important rule in FEEXSYSTEMS Phase III-E is simple:

> **The LLM interprets the World Model; it does not become the World Model.**

This is the boundary that keeps portfolio facts grounded and the AI layer replaceable.

## Two different systems

The World Model answers:

- What worlds exist?
- Which repository implements a world?
- Which artifact belongs to a repository?
- Which technologies are present?
- What relationships connect entities?

The LLM answers a different class of questions:

- How should the retrieved information be explained?
- What does a graph path mean?
- Which relevant evidence should be summarized?
- What navigation action should follow a user's request?

Confusing these responsibilities creates hallucination risk and architectural coupling.

## Tool-mediated reasoning

The model gateway exposes explicit tools:

```text
world_model_search
world_model_vector_search
world_model_neighbors
world_model_path
```

The model must retrieve evidence before making portfolio-specific claims.

```text
USER QUESTION
     ↓
LLM INTENT
     ↓
WORLD MODEL TOOL
     ↓
CANONICAL EVIDENCE
     ↓
LLM INTERPRETATION
     ↓
GROUNDED ANSWER
```

## Hybrid retrieval

Graph retrieval is excellent for explicit relationships. Vector retrieval is excellent for semantic similarity across source material.

Combining them produces:

```text
QUERY
 ├── ENTITY / GRAPH SEARCH
 └── VECTOR / DOCUMENT SEARCH
          ↓
      EVIDENCE SET
          ↓
     GRAPH EXPANSION
          ↓
     EXPLANATION
```

## Replaceable intelligence

Because the model is an adapter, FEEXSYSTEMS can change model providers without rebuilding the canonical graph, repository crawler, database schema or planetary renderer.

The durable asset is the World Model and its evidence graph—not the choice of language model.

## Memory without contamination

Navigator memory records conversation context, matched entity identifiers and retrieval context. It does not rewrite canonical facts.

```text
MEMORY = CONVERSATIONAL CONTEXT
WORLD MODEL = CANONICAL TRUTH
```

This distinction becomes increasingly important as conversations become multi-turn.

## Failure behavior

When evidence is unavailable, the Navigator should say so. A graceful “I cannot resolve that from the current World Model” is preferable to an invented repository, technology or project.

## Engineering lesson

Good AI architecture is partly about deciding what the model is **not allowed to own**.

The LLM is powerful because it is downstream from structured evidence. Keeping that boundary intact makes the system safer, more testable and easier to evolve.
