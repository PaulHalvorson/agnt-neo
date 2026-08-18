# agnt-neo

## google-workspace-mcp — multi-Workspace Google Drive connector

[`google-workspace-mcp/`](./google-workspace-mcp/) is a local MCP server that lets
Claude reach the Google Drive of any of three Google Workspaces on demand
(Triad Synergy, ARC Legacy Fund, ARC Retreat) with a per-request `workspace`
selector. See [`google-workspace-mcp/README.md`](./google-workspace-mcp/README.md)
for setup.

## Haley Fox — Missouri location reference

[`haley-fox-location-map.html`](./haley-fox-location-map.html) is a self-contained,
theme-aware map (no external dependencies) plotting three reference points in Missouri:

| Point | Location | Coordinates |
| --- | --- | --- |
| **Haley Fox** | Forsyth, MO 65653 (Taney County) | 36.685° N, 93.114° W |
| **East Wind Community** | Tecumseh, MO 65760 (Ozark County) | 36.590° N, 92.257° W |
| **Dancing Rabbit Ecovillage** | Rutledge, MO 63563 (Scotland County) | 40.187° N, 92.030° W |

**Distances from Forsyth** (straight-line / great-circle):

- **East Wind** — ~48 mi east (≈ 60 mi / ~1 hr 20 min drive via US-160 E)
- **Dancing Rabbit** — ~249 mi northeast (≈ 300 mi / ~5 hr drive)

Open the HTML file in any browser to view the interactive map. The state silhouette,
graticule, and points are rendered at true latitude/longitude with an equirectangular
projection; distances shown are great-circle and drive estimates are approximate.
