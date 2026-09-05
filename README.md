# FEEXSYSTEMS — Persona Digital Operating Environment

> **An interactive digital operating environment for exploring a builder, their systems, capabilities, projects, and evolving body of work.**

[![Portfolio OS](https://img.shields.io/badge/FEEXSYSTEMS-PERSONA%20OS-02040a?style=flat-square)](https://github.com/FeexSystems/portfolio)
[![WebGL](https://img.shields.io/badge/WebGL-3D-8ab4ff?style=flat-square)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-f7df1e?style=flat-square)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

## 01 — What This Is

FeexSystems Portfolio OS is an interactive **persona digital operating environment** rather than a conventional portfolio. Projects, capabilities and artifacts are modeled as connected worlds and nodes in a navigable knowledge graph.

```text
PERSONA → DIGITAL TWIN → KNOWLEDGE GRAPH → AI NAVIGATOR → 3D WORLD
```

## 02 — Phase III-C: Graph + Navigator

The planetary core now visualizes the underlying graph directly:

- **World nodes** orbit the planetary core.
- **Capability nodes** form a secondary constellation.
- **Connection arcs** encode world → capability relationships.
- **Focus mode** dims unrelated nodes and emphasizes the selected neighborhood.
- **Camera zoom** moves closer to the active graph neighborhood.
- **Pointer interaction** selects world nodes directly on the planet.
- **Animated rings and node pulses** provide live system telemetry.
- **World transitions** synchronize graph focus, Digital Twin state and system cards.

### Knowledge Graph

The graph is generated from the Persona Registry rather than hard-coded into the renderer.

```text
                         PERSONA CORE
                              │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
          WORLDS         CAPABILITIES       RELATIONS
            │                 │                 │
     ┌──────┼──────┐          │          WORLD → CAPABILITY
     ▼      ▼      ▼          ▼
    3WM   HOLOKAI YURRHEELER  AI / ML
     │      │       │         FINTECH
     └──────┼───────┼──────── DATA
            ▼       ▼
       KAPPAXCHANGEFIN
            │
        PAYMENTS / FINTECH
```

## 03 — System Worlds

- **3WM SONIK LABS** — AI-native audio / DSP
- **HoloKai** — cultural intelligence / world models / 3D
- **Yurrheeler AI** — multi-agent healthcare intelligence
- **KappaXchangefin** — fintech / payments / AI / financial infrastructure
- **VYRA LABS** — conversational interfaces / intelligent media
- **Rental Paradise** — property discovery / digital commerce

OjaChat has been removed from the active Persona OS world registry and replaced by **KappaXchangefin**.

## 04 — AI Navigator

The Navigator currently operates against the local Knowledge Graph and can resolve natural-language intent into connected worlds.

Example queries:

```text
“Show me the fintech systems.”
“Which worlds use AI?”
“Find projects related to payments.”
“How many worlds are connected?”
```

Resolution pipeline:

```text
USER QUERY
   ↓
INTENT / KEYWORD RESOLUTION
   ↓
KNOWLEDGE GRAPH SEARCH
   ↓
WORLD + CAPABILITY MATCH
   ↓
CONTEXT RESPONSE
   ↓
SPATIAL NAVIGATION
   ↓
DIGITAL TWIN FOCUS
```

The architecture is intentionally provider-neutral. A future model-backed layer can replace or augment the local resolver without changing the graph or rendering contract.

## 05 — Interaction Model

### Focus

Selecting a world activates its graph neighborhood. Connected capability nodes remain emphasized while unrelated nodes recede.

### Zoom

Mouse wheel / trackpad input changes the planetary camera distance, allowing the visitor to move from ecosystem-level context toward an active world.

### Spatial selection

World nodes are raycast targets in the Three.js scene. Selecting one updates:

1. Digital Twin focus
2. Graph focus
3. Camera zoom
4. System-card selection
5. World navigation state

### World transition

```text
CLICK / AI RESULT
       ↓
WORLD ID
       ↓
PERSONA TWIN ENTER
       ↓
GRAPH FOCUS
       ↓
CAMERA ZOOM
       ↓
SYSTEM WORLD HIGHLIGHT
```

## 06 — Architecture

```text
Browser
  │
  ├── index.html
  ├── styles/main.css
  │
  └── ES Modules
        │
        ├── persona-registry.js
        │      └── worlds / capabilities / relations
        │
        ├── digital-twin.js
        │      └── presence / focus / session state
        │
        ├── ai-navigator.js
        │      └── graph-aware semantic resolver
        │
        └── main.js
               ├── Three.js planetary renderer
               ├── graph nodes
               ├── connection arcs
               ├── focus / zoom controller
               ├── raycast interaction
               └── world transition bus
```

## 07 — Roadmap

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

- [ ] Graph database persistence
- [ ] Repository-aware project nodes
- [ ] Artifact nodes and case studies
- [ ] Technology/version nodes
- [ ] Timeline edges
- [ ] GitHub telemetry ingestion
- [ ] Embedding-based retrieval
- [ ] Model-backed conversational reasoning
- [ ] Multi-turn Navigator memory
- [ ] Explainable relationship paths
- [ ] Voice Navigator

### Phase IV — FEEX WORLD

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
          └─────────────────┼─────────────────┘
                            ▼
                       AI NAVIGATOR
                            │
                     COMMAND BUS / API
                            │
                       3D WORLD ENGINE
                            │
                       PLANETARY UI
```

## 08 — Development

The current foundation can run as a static site:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

Three.js is currently loaded as an ES module from a CDN.

## 09 — Design Principles

**World, not page** — major capabilities should feel like locations inside a larger digital environment.

**State, not static content** — navigation changes the Digital Twin and spatial presentation.

**Spatial meaning** — 3D geometry communicates relationships rather than serving only as decoration.

**Progressive disclosure** — ecosystem → world → capability → artifact → architecture.

**Technical transparency** — the environment demonstrates systems thinking and architecture.

**Human + machine** — the human builder is represented by the Persona layer; AI becomes the navigation interface to the body of work.

## 10 — Vision

> **A serious body of engineering work deserves an interface that behaves like a living system.**

FeexSystems is evolving toward a personal digital headquarters where visitors can explore **who is building, what is being built, how systems connect, how they are engineered, and where the ecosystem is going next.**

---

**FEEXSYSTEMS / PERSONA DIGITAL OPERATING ENVIRONMENT**  
**Building digital worlds, one system at a time.**

_Last updated: September 2026_
