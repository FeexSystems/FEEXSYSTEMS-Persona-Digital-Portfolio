# FEEXSYSTEMS — Persona Digital Operating Environment

> **A living 3D operating environment for exploring a builder, systems, repositories, artifacts, technologies, capabilities and evolution.**

[![Portfolio OS](https://img.shields.io/badge/FEEXSYSTEMS-PERSONA%20OS-02040a?style=flat-square)](https://github.com/FeexSystems/FEEXSYSTEMS-Persona-Digital-Portfolio)

## 01 — Core Architecture

The portfolio is designed as a **Digital Twin + Intelligent World Model**, not a conventional project list.

```text
PERSONA
   ↓
DIGITAL TWIN
   ↓
WORLD MODEL  ← canonical source of truth
   ↓
KNOWLEDGE GRAPH
   ↓
HYBRID RETRIEVAL
   ↓
AI NAVIGATOR
   ↓
3D PLANETARY WORLD
```

The governing principle is explicit:

```text
WORLD MODEL = WHAT EXISTS
DIGITAL TWIN = CURRENT RUNTIME STATE
LLM          = INTERPRETER / REASONER
NAVIGATOR    = HOW WE QUERY IT
PLANETARY UI = HOW WE EXPERIENCE IT
```

**The LLM never becomes the World Model.** Portfolio facts remain canonical, inspectable and replaceable independently of the model provider.

## 02 — Intelligent World Model

Phase III-D introduced a normalized semantic graph containing:

- `PERSONA`
- `WORLD`
- `REPOSITORY`
- `ARTIFACT`
- `TECHNOLOGY`
- `CAPABILITY`
- `TIMELINE`
- `EVENT`

Typed relationships include:

```text
OWNS · IMPLEMENTS · USES · DEPENDS_ON
RELATED_TO · EVOLVED_FROM · PUBLISHED · OCCURRED_AT
```

The browser keeps a local-first representation for spatial interaction. Phase III-E adds persistent repository intelligence and vector retrieval without changing the canonical graph contract.

## 03 — Phase III-E: Model-Backed Intelligence

Phase III-E turns the World Model into a live intelligence substrate.

### Implemented pipeline

```text
LIVE GITHUB
    ↓
REPOSITORY INGESTION
    ↓
AUTOMATIC CRAWLING
    ↓
README / SOURCE ANALYSIS
    ↓
TECHNOLOGY + VERSION EXTRACTION
    ↓
ARTIFACT DISCOVERY
    ↓
WORLD MODEL HYDRATION
    ↓
POSTGRESQL + PGVECTOR
    ↓
SEMANTIC + GRAPH RETRIEVAL
    ↓
NAVIGATOR MEMORY
    ↓
LLM TOOL CALLS
    ↓
EXPLAINABLE GRAPH PATHS
    ↓
VOICE / SPATIAL NAVIGATION
    ↓
LIVE REPOSITORY TELEMETRY
```

### 1. Live GitHub ingestion

`js/github-ingestion.js` reads the seeded public repositories from GitHub and captures:

- repository description
- default branch
- stars
- forks
- open issues
- last push/update timestamps
- license
- language statistics
- repository tree
- source/README documents

The crawler uses GitHub's recursive tree endpoint and raw file delivery to reduce API pressure.

### 2. README/source-code analysis

The ingestion layer prioritizes README files, package manifests, configuration files and application/source directories. Text is normalized into document records for downstream extraction and retrieval.

### 3. Technology/version extraction

The detector combines:

- GitHub language statistics
- dependency manifests
- framework signatures
- source-code signatures
- configuration signatures

Package versions are retained when discoverable from `package.json` dependencies/devDependencies.

### 4. Artifact discovery

Artifacts are discovered from:

- README sections
- configuration manifests
- application source files
- components/pages/app/lib/api/function directories

Every discovered artifact is linked back to its repository with a typed `PUBLISHED` relationship.

## 04 — PostgreSQL / pgvector

Production persistence is defined in:

```text
supabase/migrations/20260905_phase_iii_e_world_model.sql
```

The schema provides:

- canonical World Model entities
- typed graph edges
- repository documents
- chunked embeddings
- pgvector HNSW indexing
- cosine-similarity retrieval
- row-level security for read access

```text
world_model_entities
        │
        ├── world_model_edges
        │
        ├── world_model_documents
        │             ↓
        └────── world_model_embeddings
                       ↓
                    pgvector
```

The database is intentionally separate from the presentation layer.

## 05 — Semantic + Graph Hybrid Retrieval

`js/model-backed-intelligence.js` provides a hybrid retrieval contract:

```text
QUERY
 ↓
LEXICAL / SEMANTIC ENTITY MATCH
 ↓
TOP-K WORLD MODEL ENTITIES
 ↓
GRAPH NEIGHBOR EXPANSION
 ↓
SHORTEST PATH / RELATIONSHIP RESOLUTION
 ↓
EXPLAINABLE CONTEXT
 ↓
LLM INTERPRETATION
```

This means a model can explain a relationship, but the relationship itself comes from canonical graph edges.

## 06 — Multi-turn Navigator Memory

`NavigatorMemory` persists a bounded conversation history in browser storage.

Memory stores:

- user turns
- assistant turns
- matched entity IDs
- retrieval context
- timestamps

The memory layer is replaceable and deliberately separate from canonical World Model facts.

## 07 — LLM Tool-Calling

The Supabase Edge Function:

```text
supabase/functions/world-model-ai/index.ts
```

provides a model gateway with explicit World Model tools:

```text
world_model_search
world_model_neighbors
world_model_path
```

The LLM is instructed to use these tools for factual grounding. It can interpret, summarize, connect, explain and navigate retrieved facts, but cannot author canonical portfolio entities.

The current gateway is provider-adapter based. The model can be changed without rewriting the World Model, graph renderer or Navigator contract.

For the current OpenAI integration, the gateway uses the Responses API and a configurable `OPENAI_MODEL` environment variable. The default is `gpt-5.6-luna`.

## 08 — Explainable Graph Paths

Graph traversal returns both entity IDs and typed relationship explanations.

Example:

```text
KAPPAXCHANGEFIN
      │ IMPLEMENTS
      ▼
ISO 20022 FINANCIAL INFRASTRUCTURE
      │ USES
      ▼
ISO 20022
```

The Navigator can expose the path instead of returning an opaque generated claim.

## 09 — Voice Navigation

`js/voice-navigator.js` provides a browser voice adapter using available Web Speech APIs.

```text
VOICE INPUT
    ↓
NAVIGATOR QUERY
    ↓
WORLD MODEL RETRIEVAL
    ↓
MODEL INTERPRETATION
    ↓
GROUNDed RESPONSE
```

The interface also supports speech synthesis when the browser exposes `speechSynthesis`.

## 10 — Real-Time Repository Telemetry

The Phase III-E bootstrap starts an ingestion cycle and refreshes repository intelligence every ten minutes.

The live HUD reports:

- synchronization state
- repositories processed
- documents crawled
- technologies detected
- artifacts discovered
- ingestion errors

The telemetry layer is observational; it does not replace canonical graph state.

## 11 — Phase III-E Runtime Modules

```text
js/
├── persona-registry.js
│   └── canonical Persona seed graph
├── world-model.js
│   └── canonical in-browser World Model contract
├── github-ingestion.js
│   └── GitHub crawling + extraction
├── model-backed-intelligence.js
│   └── retrieval + memory + LLM adapter
├── ai-navigator.js
│   └── graph Navigator + model bridge
├── voice-navigator.js
│   └── voice input/output adapter
├── phase-iii-e-bootstrap.js
│   └── telemetry + voice + live sync bootstrap
└── main.js
    └── Three.js planetary renderer + spatial navigation

supabase/
├── migrations/
│   └── 20260905_phase_iii_e_world_model.sql
└── functions/
    ├── world-model-ai/
    │   └── index.ts
    └── world-model-embed/
        └── index.ts
```

## 12 — System Worlds

- **3WM SONIK LABS** — AI-native audio / DSP
- **HoloKai** — cultural intelligence / world models / 3D
- **Yurrheeler AI** — multi-agent healthcare intelligence
- **KappaXchangefin** — fintech / payments / AI / financial infrastructure
- **VYRA LABS** — conversational interfaces / intelligent media
- **Rental Paradise** — property discovery / digital commerce

OjaChat has been removed from the active Persona OS world registry and replaced by **KappaXchangefin**.

## 13 — Planetary World Model Visualization

The Three.js planetary core renders World Model relationships as spatial information.

```text
             PERSONA CORE
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    WORLD NODES        CAPABILITY NODES
        │                   │
        └──── CONNECTION ARCS┘
                  │
             GRAPH FOCUS
                  │
             CAMERA ZOOM
                  │
          WORLD TRANSITION
```

The Digital Twin synchronizes selected worlds, focus state, visits and runtime presence with this spatial layer.

## 14 — Phase Status

### Phase I — Planetary Foundation

- [x] Planetary visual identity
- [x] WebGL globe
- [x] Orbital system
- [x] Star field
- [x] System-world cards
- [x] Capability constellation
- [x] Boot sequence
- [x] Responsive experience

### Phase II — Interactive Persona OS

- [x] Command palette
- [x] Keyboard-first navigation
- [x] World selection state
- [x] Planetary camera interaction
- [x] Persistent Digital Twin state
- [x] Persona HUD

### Phase III-C — Knowledge Graph + AI Navigator

- [x] Persona Registry
- [x] Knowledge Graph generation
- [x] Graph-aware Navigator
- [x] Animated planetary graph nodes
- [x] Connection arcs
- [x] Node focus / neighborhood highlighting
- [x] Camera zoom / focus state
- [x] Spatial world selection
- [x] AI result → world transition
- [x] KappaXchangefin integration

### Phase III-D — Intelligent World Model

- [x] World Model schema
- [x] Repository entity layer
- [x] Artifact entity layer
- [x] Technology entity layer
- [x] Capability entity layer
- [x] Timeline entity layer
- [x] Typed relationship edges
- [x] Graph traversal / paths
- [x] World Model-aware Navigator
- [x] Neighbor expansion
- [x] Local model persistence

### Phase III-E — Model-Backed Intelligence

- [x] Live GitHub ingestion
- [x] Automatic repository crawling
- [x] README/source-code analysis
- [x] Technology/version extraction
- [x] Artifact discovery
- [x] PostgreSQL/pgvector schema
- [x] Embedding ingestion function
- [x] Semantic + graph hybrid retrieval
- [x] Multi-turn Navigator memory
- [x] LLM tool-calling against the World Model
- [x] Explainable graph paths
- [x] Voice navigation adapter
- [x] Real-time repository telemetry

## 15 — Configuration

The browser never receives provider secrets. The model gateway is intended to run as a Supabase Edge Function.

Configure server-side secrets such as:

```text
OPENAI_API_KEY
OPENAI_MODEL=gpt-5.6-luna
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Then point the browser adapter at the deployed gateway using:

```js
window.FEEX_AI_ENDPOINT = 'https://<project-ref>.supabase.co/functions/v1/world-model-ai';
```

The frontend remains usable without the gateway; it falls back to grounded local World Model retrieval.

## 16 — Development

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

The static frontend uses ES modules and Three.js from CDN. Supabase functions and migrations form the production intelligence layer.

## 17 — Design Principles

**Canonical data + model reasoning** — the World Model is authoritative; the LLM interprets it.

**Graph, not list** — relationships are first-class information.

**Evidence, not claims** — repositories and artifacts provide traceable implementation evidence.

**Provider-neutral intelligence** — model providers can be replaced without replacing the World Model.

**Progressive disclosure** — ecosystem → world → repository → artifact → technology → source.

**Spatial meaning** — the 3D interface communicates relationships rather than acting as decoration.

**Human + machine** — the Persona is the builder; the AI is the navigation and reasoning interface.

## 18 — Vision

> **A serious body of engineering work deserves an interface that behaves like a living system.**

FEEXSYSTEMS is evolving toward a personal digital headquarters where visitors can explore **who is building, what is being built, how systems connect, where implementation lives, which technologies are involved, how the ecosystem evolved, and where it is going next.**

---

**FEEXSYSTEMS / PERSONA DIGITAL OPERATING ENVIRONMENT**  
**Building digital worlds, one system at a time.**

_Last updated: September 2026_
