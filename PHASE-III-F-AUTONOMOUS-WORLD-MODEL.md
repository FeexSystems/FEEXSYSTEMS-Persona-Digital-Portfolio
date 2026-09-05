# Phase III-F — Autonomous World-Model Agent

## Objective

Phase III-F evolves FEEXSYSTEMS from model-backed intelligence into a continuously observed, temporally aware and proactively navigable **FEEX WORLD**.

```text
PHASE III-E
MODEL-BACKED INTELLIGENCE
        ↓
PHASE III-F
AUTONOMOUS WORLD-MODEL AGENT
        ↓
LIVE REPOSITORY CHANGE DETECTION
        ↓
CONTINUOUS GRAPH MUTATION
        ↓
PREDICTIVE / PROACTIVE NAVIGATOR
        ↓
PERSONA DIGITAL TWIN
        ↓
FEEX WORLD
```

## Responsibility boundary

```text
GitHub / external evidence → observation
Ingestion engine            → extraction
World Model                 → canonical facts
Graph                       → relationships
Temporal layer              → history / evolution
Agent                       → reasoning / planning
Tool runtime                → constrained execution
Navigator                   → interaction / prediction
Event system                → proactive signals
Digital Twin                → runtime persona state
Planetary UI                → spatial experience
LLM                         → interpretation only
```

**The LLM is not permitted to become the World Model.** Autonomous behavior is constrained by evidence, explicit tools, mutation validation and provenance.

## Implementation map

### III-F.1 — Repository Webhook / Change Detection

- `js/phase-iii-f-change-detection.js`
- `supabase/functions/world-model-webhook/index.ts`

GitHub push events can be authenticated with HMAC SHA-256 and queued as World Model events. The browser detector also maintains a local repository-state cache for periodic change detection.

### III-F.2 — Incremental Ingestion Engine

The existing Phase III-E ingestion layer is reused as the observation/extraction substrate. Phase III-F consumes only repository changes rather than treating every synchronization as a full world rebuild.

### III-F.3 — Entity + Relationship Mutation Engine

`js/phase-iii-f-mutation-engine.js` introduces validated mutations:

- `UPSERT_ENTITY`
- `UPSERT_EDGE`
- `REMOVE_EDGE`
- `REMOVE_ENTITY`

Mutations carry provenance and can be proposed before commitment. This preserves a controlled boundary between autonomous reasoning and canonical state.

### III-F.4 — Temporal World Model

`js/phase-iii-f-temporal-world-model.js` records:

- repository changes
- entity history
- before/after state
- evidence references
- runtime snapshots
- model evolution

Persistence is defined in `supabase/migrations/20260905_phase_iii_f_autonomy.sql`.

### III-F.5 — Autonomous World-Model Agent

`js/phase-iii-f-agent.js` provides an event-driven agent loop:

```text
OBSERVE → ANALYZE → PROPOSE → VALIDATE → COMMIT
```

The agent receives repository observations and produces constrained World Model mutations.

### III-F.6 — Agent Tool Runtime

`js/phase-iii-f-agent-runtime.js` exposes an allow-listed tool boundary and records execution traces. Tools are explicitly registered rather than dynamically granted to the model.

### III-F.7 — Predictive Navigator

`js/phase-iii-f-predictive-navigator.js` observes repeated signals and produces explainable prediction candidates. This is deliberately conservative: predictions are signals, not canonical facts.

### III-F.8 — Proactive Event System

`js/phase-iii-f-event-system.js` provides persistent, acknowledgeable events for:

- repository changes
- World Model mutations
- predictions
- world-state transitions
- agent activity

### III-F.9 — Digital Twin Intelligence Layer

`js/phase-iii-f-digital-twin-intelligence.js` extends the existing Digital Twin with active context, signals and reasoning state while keeping the canonical World Model separate.

### III-F.10 — FEEX WORLD Runtime

`js/feex-world-runtime.js` is the integration boundary for the autonomous environment. It exposes a coherent runtime snapshot containing World Model state, Digital Twin state and pending proactive events.

## Server-side event flow

```text
GitHub push webhook
       ↓
HMAC verification
       ↓
world_model_events
       ↓
world-model-agent
       ↓
repository entity update
       ↓
entity history
       ↓
proactive event
       ↓
Navigator / Digital Twin
```

## Security model

- Webhooks require `GITHUB_WEBHOOK_SECRET`.
- Supabase service-role credentials remain server-side.
- Browser code never receives provider secrets.
- Agent tools are allow-listed.
- Canonical mutations require provenance.
- Predictions are separated from facts.
- LLM output is not persisted as canonical portfolio truth.

## Required deployment configuration

```text
GITHUB_WEBHOOK_SECRET=<secret>
SUPABASE_SERVICE_ROLE_KEY=<server-side secret>
OPENAI_API_KEY=<server-side secret when model reasoning is enabled>
OPENAI_MODEL=gpt-5.6-luna
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

Configure the GitHub repository webhook to send `application/json` push events to the deployed `world-model-webhook` Edge Function. The `world-model-agent` function should be invoked by a scheduled worker, queue consumer, or Supabase scheduler after events are received.

## Autonomy levels

```text
LEVEL 0 — OBSERVE
Detect and record changes.

LEVEL 1 — EXTRACT
Identify evidence, entities and technologies.

LEVEL 2 — PROPOSE
Generate candidate graph mutations.

LEVEL 3 — VALIDATE
Check schema, provenance and relationships.

LEVEL 4 — COMMIT
Apply approved canonical mutations.

LEVEL 5 — PROACTIVE
Generate explainable signals for the Navigator.

LEVEL 6 — ADAPTIVE WORLD
Continuously synchronize Persona, World Model and spatial runtime.
```

The implementation should advance through these levels without granting unrestricted autonomous write authority to the model.

## Target state

```text
                     FEEX WORLD
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
     DIGITAL TWIN    WORLD MODEL    KNOWLEDGE FABRIC
          │              │              │
          ↓              ↓              ↓
      PRESENCE         GRAPH          VECTORS
          │              │              │
          └──────────────┼──────────────┘
                         ↓
                 AUTONOMOUS AGENT
                         │
                  OBSERVE / REASON
                         │
                      PROPOSE
                         │
                     VALIDATE
                         │
                      MUTATE
                         ↓
                  PROACTIVE WORLD
                         ↓
                  PLANETARY UI
```

**FEEX WORLD is a living system, not a static portfolio page.**