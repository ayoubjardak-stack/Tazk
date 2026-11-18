# Tazk — Project Description

## Overview

Tazk is a lightweight, offline desktop application for managing a personal to-do list. It runs as a native desktop window while being built entirely with web technologies, giving it the simplicity of a web app with the feel of a native program. All data stays on the user's machine.

## Technology Stack

| Layer     | Technology                                             |
| --------- | ------------------------------------------------------ |
| Shell     | Tauri 2 (Rust) — native window, no Electron overhead   |
| Frontend  | Vanilla HTML, CSS, JavaScript (no framework, no bundler) |
| Storage   | Browser `localStorage` (persisted in the WebView)      |
| Language  | JavaScript (ES modules) + Rust                         |
| Build     | Cargo + Tauri CLI                                      |

Because the frontend uses plain HTML/CSS/JS with no build step, the app is extremely lightweight and starts fast, while still being packaged as a real cross-platform desktop application.

## Features

- **Tasks with rich detail** — each task has a title, priority (low / medium / high), an optional due date, and optional notes.
- **Completion** — check tasks off; completed tasks automatically sort below active ones.
- **Inline editing** — open any task to change its title, priority, due date, or notes without leaving the list.
- **Safe deletion** — two-step confirm before deleting, plus a "Clear completed" action to remove all finished tasks at once.
- **Filtering & search** — filter by All / Active / Done, and search across titles and notes.
- **Progress tracking** — progress bar, per-filter counts, "N tasks left" footer, and overdue highlighting.
- **Appearance** — light and dark mode, with a responsive layout that adapts to narrow window widths.
- **Local persistence** — tasks are saved automatically in `localStorage` under the key `task-manager.tasks.v1`, with validation and safe defaults when loading.

## Project Structure

```
tazk/
├── src/                     # Frontend (loaded directly by Tauri)
│   ├── index.html           # Markup
│   ├── styles.css           # Styling, dark mode, responsive rules
│   ├── main.js              # Rendering and event wiring (UI controller)
│   ├── tasks.js             # Pure task logic: create, update, filter, sort, counts
│   └── storage.js           # localStorage load/save with validation
├── src-tauri/               # Rust shell
│   ├── src/
│   │   ├── main.rs          # Entry point
│   │   └── lib.rs           # Builds the Tauri app, registers opener plugin
│   ├── Cargo.toml           # Rust dependencies
│   └── tauri.conf.json      # App config (window size, title, bundling)
└── README.md
```

## Design Highlights

- **Separation of concerns** — business logic ([tasks.js](../src/tasks.js)) is kept pure and independent of the DOM, while [main.js](../src/main.js) handles all rendering and events. This makes the logic easy to test and reason about.
- **Smart sorting** — incomplete tasks first, then by priority, then earliest due date, then creation order.
- **Focus preservation** — the UI re-renders fully on each change but captures and restores input focus and cursor position so typing is never interrupted.
- **Robust persistence** — every change is saved automatically; data on load is validated and normalized with safe fallbacks.
- **No external dependencies** on the frontend — no npm packages, no framework, no bundler required.

## Use Cases

- Personal daily task and to-do tracking
- Lightweight project or checklist management
- A starter template for small desktop apps built with Tauri

## Running

```sh
cargo tauri dev
# or
cargo run --manifest-path src-tauri/Cargo.toml
```

## Summary

TaskFlow demonstrates how to build a fast, fully offline desktop application with minimal complexity. By combining Tauri's lightweight native shell with a clean, dependency-free web frontend, it delivers a responsive, privacy-friendly task manager that is easy to understand, extend, and maintain.