# Live Presence & Shared Sessions (PRESENCE-ENGINE.md)

## 1. Heartbeats & Online Tracking
User presence is tracked via status updates. Each peer heartbeat contains:
- **userId & userName:** User identity.
- **status:** `ONLINE` | `AWAY` | `OFFLINE`.
- **activeView:** The view the user is looking at (e.g. `cad`, `workflow`, `collaboration`).
- **lastSeen:** ISO timestamp.

## 2. Interactive Peer Cursor Sharing
Co-editing rooms map real-time pointers.
- Coordinates scale to the responsive boundaries of the active element using standard percentages.
- Cursors are pushed dynamically into state representations to render real-time overlay paths.
- Facilitates side-by-side design reviews between clients, engineers, and Vastu experts.
