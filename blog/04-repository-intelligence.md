# Repository Intelligence: When the Source Becomes Evidence

**Published:** September 2026  
**Series:** Repository Intelligence  
**Reading Time:** 10 min  
**Status:** Phase III-E

## From links to evidence

A repository link is only an address. Repository intelligence turns that address into structured evidence.

The ingestion pipeline observes:

```text
REPOSITORY
 ↓
METADATA
 ↓
TREE
 ↓
README / SOURCE
 ↓
MANIFESTS
 ↓
TECHNOLOGIES
 ↓
ARTIFACTS
 ↓
WORLD MODEL
```

## GitHub ingestion

The server-side ingestion function reads canonical repositories and persists repository metadata, language statistics, branches, source documents and relationships.

This allows the portfolio to know more than the repository URL. It can understand what implementation evidence exists inside the repository.

## Crawling strategy

The crawler prioritizes useful text sources and avoids generated or dependency-heavy directories such as `node_modules`, build output and version-control internals.

Relevant files include:

- README and Markdown documentation
- package manifests
- TypeScript / JavaScript source
- configuration files
- styles
- SQL
- Python and other source formats when present

## Technology extraction

Package manifests provide high-quality technology evidence. Versions are retained when the dependency declaration exposes a recognizable version.

Language statistics provide a second evidence channel.

Source signatures can provide a third channel for future extractors.

## Artifact discovery

Artifacts are implementation-level objects: applications, components, pages, services, configuration surfaces, APIs and other meaningful pieces of a system.

Artifact discovery allows a visitor to move from:

```text
WORLD
 ↓
REPOSITORY
 ↓
ARTIFACT
 ↓
TECHNOLOGY
 ↓
SOURCE
```

## Provenance

Every ingested document should retain repository identity, path, commit/tree SHA and source reference. Provenance is essential when the Navigator explains where an answer came from.

## Telemetry

Repository intelligence also creates a natural telemetry surface:

- last update
- repository count
- documents crawled
- technologies detected
- artifacts discovered
- ingestion errors

Telemetry should describe ingestion state; it should not fabricate project activity.

## Engineering lesson

The source repository is not merely something to link from a portfolio. It is an evidence layer that can continuously hydrate a semantic model.
