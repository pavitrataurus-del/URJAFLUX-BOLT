# Threaded Discussion Engine (DISCUSSION-ENGINE.md)

## 1. Thread Lifecycle
Threads represent active conversations centered around workspaces, consultation logs, or structural artifacts.
- **OPEN:** Active conversation where members can comment, add replies, and attach images.
- **RESOLVED:** Archived conversation indicating consensus. Read-only by default.
- **LOCKED:** Administrative lock. No comments can be added.

## 2. Text Formatting & Attachments
- **Markdown-Like Render:** Content strings parse lines, lists, and bold text.
- **Attachments:** Files mapped into comment structures with type, name, download path, and owner details.
- **Nested Replies:** Sub-arrays of replies directly tied to parent Comments, supporting tree-style navigation.
