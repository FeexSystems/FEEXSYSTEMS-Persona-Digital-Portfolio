# The Intelligent World Model: Turning a Portfolio into a Knowledge Graph

**Published:** September 2026  
**Series:** Intelligent World Model  
**Reading Time:** 12 min  
**Status:** Phase III-D foundation

## The problem with a static registry

A project registry is useful for rendering cards, but it loses relationships. A project can implement a repository, depend on technologies, produce artifacts, belong to a capability and participate in an evolution timeline.

Those relationships are first-class information.

## Entity model

FEEXSYSTEMS uses explicit entity types:

```text
PERSONA
WORLD
REPOSITORY
ARTIFACT
TECHNOLOGY
CAPABILITY
TIMELINE
EVENT
```

Relationships are typed:

```text
OWNS
IMPLEMENTS
USES
DEPENDS_ON
RELATED_TO
EVOLVED_FROM
PUBLISHED
OCCURRED_AT
```

## Why typed edges matter

A generic connection only says that two things are related. A typed edge explains how.

For example:

```text
WORLD ──IMPLEMENTS──> REPOSITORY
REPOSITORY ──USES──> TECHNOLOGY
ARTIFACT ──EVOLVED_FROM──> TIMELINE
```

That structure makes graph traversal explainable.

## Graph paths

A Navigator query such as “how are these two worlds connected?” should not require the model to invent a narrative. The graph can compute a path first.

```text
START ENTITY
    ↓
BREADTH-FIRST TRAVERSAL
    ↓
TYPED EDGES
    ↓
TARGET ENTITY
    ↓
EXPLAINABLE PATH
```

The model may then turn the path into natural language.

## Canonical data boundary

The World Model is authoritative. The LLM is downstream.

This creates a durable contract:

```text
WORLD MODEL
  ├─ canonical entities
  ├─ canonical relationships
  └─ provenance

LLM
  ├─ interpretation
  ├─ summarization
  ├─ reasoning over retrieved context
  └─ navigation intent
```

The model cannot silently mutate the canonical portfolio graph merely because it generated a plausible sentence.

## Repository-aware evolution

The next step is connecting graph entities to live GitHub evidence. Repository metadata, source documents, dependencies and discovered artifacts become evidence that can hydrate the model.

## Engineering lesson

The World Model is not another UI state object. It is a semantic contract between data ingestion, retrieval, reasoning and experience.

Once that contract exists, the portfolio can evolve from a collection of pages into a navigable digital ecosystem.
