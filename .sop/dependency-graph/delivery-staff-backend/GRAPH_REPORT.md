# Graph Report - delivery-staff  (2026-04-26)

## Corpus Check
- 3 files · ~773 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 11 nodes · 10 edges · 3 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]

## God Nodes (most connected - your core abstractions)
1. `StartupInfoListener` - 4 edges
2. `DeliveryStaffApplication` - 2 edges
3. `DeliveryStaffApplicationTests` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities

### Community 0 - "Community 0"
Cohesion: 0.6
Nodes (1): StartupInfoListener

### Community 1 - "Community 1"
Cohesion: 0.67
Nodes (1): DeliveryStaffApplication

### Community 2 - "Community 2"
Cohesion: 0.67
Nodes (1): DeliveryStaffApplicationTests

## Knowledge Gaps
- **Thin community `Community 0`** (5 nodes): `StartupInfoListener.java`, `StartupInfoListener`, `.onApplicationEvent()`, `.readVitePort()`, `.viteDevServerHint()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 1`** (3 nodes): `DeliveryStaffApplication`, `.main()`, `DeliveryStaffApplication.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 2`** (3 nodes): `DeliveryStaffApplicationTests`, `.contextLoads()`, `DeliveryStaffApplicationTests.java`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Not enough signal to generate questions. This usually means the corpus has no AMBIGUOUS edges, no bridge nodes, no INFERRED relationships, and all communities are tightly cohesive. Add more files or run with --mode deep to extract richer edges._