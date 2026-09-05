# FEEXSYSTEMS — Persona Digital Operating Environment

> **An interactive digital operating environment for exploring a builder, their systems, capabilities, projects, artifacts, technologies, and evolving body of work.**

[![Portfolio OS](https://img.shields.io/badge/FEEXSYSTEMS-PERSONA%20OS-02040a?style=flat-square)](https://github.com/FeexSystems/portfolio)
[![WebGL](https://img.shields.io/badge/WebGL-3D-8ab4ff?style=flat-square)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-f7df1e?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 01 — What This Is

FeexSystems Portfolio OS is an interactive **persona digital operating environment**, not a conventional portfolio. The experience models work as a connected world: projects become worlds, technologies become nodes, artifacts become evidence, repositories become implementation sources, and timelines provide evolution.

```text
PERSONA → DIGITAL TWIN → WORLD MODEL → KNOWLEDGE GRAPH → AI NAVIGATOR → 3D WORLD
```

## 02 — Intelligent World Model

**Phase III-D is now active.** The static Persona Registry is no longer the only semantic source. A new World Model layer builds a normalized graph of:

- **Persona entities** — the builder and identity layer.
- **World entities** — products, systems and projects.
- **Repository entities** — implementation sources associated with worlds.
- **Artifact entities** — case studies, interfaces, specifications and technical outputs.
- **Technology entities** — frameworks, runtimes, protocols and infrastructure.
- **Capability entities** — domains of engineering competence.
- **Timeline entities** — phases and evolution of the ecosystem.
- **Relationship edges** — ownership, implementation, usage, dependency, evolution and temporal relationships.

### World Model schema

```text
ENTITY TYPES
────────────────────────────────────────────
PERSONA
WORLD
REPOSITORY
ARTIFACT
TECHNOLOGY
CAPABILITY
TIMELINE
EVENT

EDGE TYPES
────────────────────────────────────────────
OWNS
IMPLEMENTS
USES
DEPENDS_ON
RELATED_TO
EVOLVED_FROM
PUBLISHED
OCCURRED_AT
```

The model is deliberately **local-first and provider-neutral**. It can be hydrated from GitHub or another source without coupling the rendering layer to an external service.

### Repository-aware architecture

```text
                  INTELLIGENT WORLD MODEL
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
   PERSONA              WORLDS            REPOSITORIES
       │                   │                   │
       │                   ├──────────────┐    │
       │                   ▼              ▼    │
       │              ARTIFACTS      TECHNOLOGIES
       │                   │              │
       └───────────────────┼──────────────┘
                           ▼
                     CAPABILITIES
                           │
                           ▼
                       TIMELINE
```

Repository seed metadata is maintained separately from presentation data so a future GitHub ingestion adapter can replace seed values with live repository telemetry.

## 03 — Graph Paths

The World Model includes graph traversal rather than simple keyword matching. `graphPath()` performs a breadth-first relationship traversal between entities.

Example:

```text
KAPPAXCHANGEFIN
      │
      ▼
ISO 20022 ARTIFACT
      │
      ▼
ISO 20022 TECHNOLOGY
```

This allows the Navigator to answer relationship-oriented queries such as:

```text
“What connects KappaXchangefin and ISO 20022?”
“Find the path between two systems.”
“What technologies support this artifact?”
“What repositories implement this world?”
```

## 04 — AI Navigator 2.0

The Navigator has evolved from a Persona keyword search into a **World Model graph agent**.

Current resolution pipeline:

```text
USER QUERY
    ↓
NORMALIZE / TOKENIZE
    ↓
WORLD MODEL ENTITY SEARCH
    ↓
SEMANTIC MATCH
    ↓
NEIGHBOR EXPANSION
    ↓
RELATIONSHIP / PATH RESOLUTION
    ↓
CONTEXT RESPONSE
    ↓
SPATIAL WORLD NAVIGATION
```

It can now reason over:

- worlds
- repositories
- artifacts
- technologies
- capabilities
- timelines
- graph relationships
- connected entities
- graph statistics

### Example interactions

```text
“Show me fintech systems.”
→ KappaXchangefin

“What technologies are used by the Persona OS?”
→ Three.js / WebGL / JavaScript / Knowledge Graph

“Show repositories.”
→ Repository entities

“What connects the planetary graph and AI Navigator?”
→ Relationship/path resolution

“How many technologies are modeled?”
→ World Model statistics
```

## 05 — Embeddings Architecture

The current implementation uses deterministic local matching. The graph contract is prepared for an embedding retrieval layer without requiring a rewrite of the Navigator.

Target architecture:

```text
ENTITY / ARTIFACT
       ↓
TEXT REPRESENTATION
       ↓
EMBEDDING MODEL
       ↓
VECTOR INDEX
       ↓
TOP-K RETRIEVAL
       ↓
GRAPH EXPANSION
       ↓
RERANK / CONTEXT
       ↓
CONVERSATIONAL NAVIGATOR
```

The recommended production implementation is to store vectors separately from canonical graph entities. PostgreSQL + pgvector is a natural future adapter, while the browser remains a presentation/client layer.

## 06 — Repository Intelligence Roadmap

The repository-aware model currently provides **seeded repository entities**. The next ingestion adapter should retrieve live metadata such as:

- repository description
- default branch
- stars
- forks
- open issues
- last update
- language statistics
- releases
- contributors
- directory structure
- README sections
- source files
- detected technologies
- architecture patterns

The resulting pipeline becomes:

```text
GITHUB
  ↓
REPOSITORY INGESTOR
  ↓
NORMALIZER
  ↓
ENTITY EXTRACTOR
  ↓
TECH / ARTIFACT DETECTOR
  ↓
GRAPH BUILDER
  ↓
EMBEDDING INDEX
  ↓
WORLD MODEL
```

## 07 — System Worlds

- **3WM SONIK LABS** — AI-native audio / DSP
- **HoloKai** — cultural intelligence / world models / 3D
- **Yurrheeler AI** — multi-agent healthcare intelligence
- **KappaXchangefin** — fintech / payments / AI / financial infrastructure
- **VYRA LABS** — conversational interfaces / intelligent media
- **Rental Paradise** — property discovery / digital commerce

OjaChat has been removed from the active Persona OS world registry and replaced by **KappaXchangefin**.

## 08 — Planetary World Model Visualization

The 3D planetary core is now a graph viewport.

```text
                       PERSONA CORE
                            │
                  ┌─────────┴─────────┐
                  │                   │
               WORLD NODES       CAPABILITY NODES
                  │                   │
                  └─────────┬─────────┘
                            │
                     CONNECTION ARCS
                            │
                      GRAPH FOCUS
                            │
                      CAMERA ZOOM
                            │
                    WORLD TRANSITION
```

Interaction states:

**Ecosystem view** — all graph entities are visible.

**World focus** — the selected world and its immediate neighborhood become dominant.

**Relationship view** — graph edges become the primary visual signal.

**Spatial transition** — selecting an entity moves the Digital Twin and planetary camera toward that world.

## 09 — Digital Twin

The Digital Twin remains the runtime state layer above the World Model:

```text
WORLD MODEL = WHAT EXISTS
DIGITAL TWIN = CURRENT STATE
NAVIGATOR = HOW WE QUERY IT
PLANETARY ENGINE = HOW WE EXPERIENCE IT
```

The Twin persists local session information including presence, focus, visited worlds and recent history.

## 10 — Architecture

```text
Browser
  │
  ├── index.html
  ├── styles/main.css
  │
  └── ES Modules
        │
        ├── persona-registry.js
        │      └── canonical Persona seed data
        │
        ├── world-model.js
        │      ├── entity schema
        │      ├── repository seeds
        │      ├── artifact seeds
        │      ├── technology nodes
        │      ├── timeline
        │      ├── graph edges
        │      └── graph traversal
        │
        ├── digital-twin.js
        │      └── presence / focus / session state
        │
        ├── ai-navigator.js
        │      ├── entity matching
        │      ├── neighborhood expansion
        │      ├── relationship queries
        │      ├── graph statistics
        │      └── path resolution
        │
        └── main.js
               ├── Three.js planetary renderer
               ├── graph nodes
               ├── relationship arcs
               ├── focus / zoom controller
               ├── raycast interaction
               └── world transition bus
```

## 11 — Phase Status

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
- [x] System/world selection state
- [x] Planetary camera interaction
- [x] Persistent Digital Twin state
- [x] Persona HUD

### Phase III-C — Knowledge Graph + AI Navigator

- [x] Persona Registry
- [x] Knowledge Graph generation
- [x] Graph-aware local Navigator
- [x] World → capability relationships
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
- [ ] Live GitHub repository ingestion
- [ ] Source-code entity extraction
- [ ] Technology/version detection
- [ ] Artifact auto-discovery
- [ ] Embedding index
- [ ] pgvector retrieval
- [ ] Model-backed conversational reasoning
- [ ] Multi-turn graph memory
- [ ] Explainable relationship paths
- [ ] Voice Navigator

## 12 — Phase III-E: Model-Backed Intelligence

The next intelligence layer should sit behind an explicit provider adapter:

```text
                    AI NAVIGATOR
                         │
                  INTENT ROUTER
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
       GRAPH          VECTOR          MEMORY
       SEARCH        RETRIEVAL         STORE
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    LLM ADAPTER
                         │
                    TOOL / GRAPH
                    INTERPRETATION
                         │
                         ▼
                   GROUNDED ANSWER
                         │
                         ▼
                  SPATIAL COMMAND
```

The model should never be the source of truth for portfolio facts. Canonical facts come from the World Model; the model interprets, summarizes, plans and navigates those facts.

## 13 — FEEX WORLD

```text
                         PERSONA
                            │
                       DIGITAL TWIN
                            │
                      WORLD MODEL
                            │
                    KNOWLEDGE GRAPH
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
       WORLDS          CAPABILITIES       ARTIFACTS
          │                 │                 │
       REPOS          TECHNOLOGIES       TIMELINES
          └─────────────────┼─────────────────┘
                            ▼
                      VECTOR MEMORY
                            │
                       AI NAVIGATOR
                            │
                     COMMAND BUS / API
                            │
                       3D WORLD ENGINE
                            │
                       PLANETARY UI
```

## 14 — Development

The current foundation can run as a static site:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Three.js is currently loaded as an ES module from a CDN.

## 15 — Design Principles

**World, not page** — major capabilities should feel like locations inside a larger digital environment.

**Graph, not list** — relationships are first-class information.

**State, not static content** — navigation changes the Digital Twin and spatial presentation.

**Evidence, not claims** — repositories and artifacts become traceable implementation evidence.

**Spatial meaning** — 3D geometry communicates relationships rather than serving only as decoration.

**Progressive disclosure** — ecosystem → world → repository → technology → artifact → architecture.

**Canonical data + model reasoning** — the World Model remains authoritative while AI interprets and navigates it.

**Human + machine** — the human builder is represented by the Persona layer; AI becomes the navigation interface to the body of work.

## 16 — Vision

> **A serious body of engineering work deserves an interface that behaves like a living system.**

FeexSystems is evolving toward a personal digital headquarters where visitors can explore **who is building, what is being built, how systems connect, where the implementation lives, which technologies are involved, how the ecosystem evolved, and where it is going next.**

---

**FEEXSYSTEMS / PERSONA DIGITAL OPERATING ENVIRONMENT**  
**Building digital worlds, one system at a time.**

_Last updated: September 2026_
