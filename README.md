# Tazk

```sh
cargo tauri dev
```

If the Tauri CLI is installed, that's all you need — the app loads its frontend directly from `src/`. Alternatively, build and run the Rust shell directly:

```sh
cargo run --manifest-path src-tauri/Cargo.toml
```
 
A lightweight, focused desktop task manager built with [Tauri 2](https://tauri.app) and vanilla HTML, CSS and JavaScript. No bundler, no runtime dependencies on the frontend — just a clean, fast app that keeps your tasks organized and your data on your machine.

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

## Design Highlights

- **Separation of concerns** — business logic ([tasks.js](../src/tasks.js)) is kept pure and independent of the DOM, while [main.js](../src/main.js) handles all rendering and events. This makes the logic easy to test and reason about.
- **Smart sorting** — incomplete tasks first, then by priority, then earliest due date, then creation order.
- **Focus preservation** — the UI re-renders fully on each change but captures and restores input focus and cursor position so typing is never interrupted.
- **Robust persistence** — every change is saved automatically; data on load is validated and normalized with safe fallbacks.

## Running

```sh
cargo tauri dev
# or
cargo run --manifest-path src-tauri/Cargo.toml
```

If the Tauri CLI is installed, that's all you need — the app loads its frontend directly from `src/`. Alternatively, build and run the Rust shell directly:

```sh
cargo run --manifest-path src-tauri/Cargo.toml
```

The first build compiles all Rust dependencies and may take a few minutes.

## Project layout

- `src/index.html` — markup
- `src/styles.css` — styling, dark mode, responsive rules
- `src/main.js` — rendering and event wiring (UI controller)
- `src/tasks.js` — pure task logic (create, update, filter, sort, counts)
- `src/storage.js` — `localStorage` load/save with validation
- `src-tauri/` — Rust shell and Tauri configuration

## Recommended IDE setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## Summary

TaskFlow demonstrates how to build a fast, fully offline desktop application with minimal complexity. By combining Tauri's lightweight native shell with a clean, dependency-free web frontend, it delivers a responsive, privacy-friendly task manager that is easy to understand, extend, and maintain.

(Note: "TaskFlow" appears to be a leftover from an earlier template; the actual app and package are called "Tazk" throughout the project.)


# Tazk

A lightweight, focused desktop task manager built with [Tauri 2](https://tauri.app) and vanilla HTML, CSS and JavaScript. No bundler, no runtime dependencies on the frontend — just a clean, fast app that keeps your tasks organized and your data on your machine.

## Features

- Add tasks with a priority (low / medium / high), an optional due date and optional notes
- Complete tasks with a checkbox; completed tasks sort below active ones
- Inline editing: open a task to change its title, priority, due date or notes
- Delete with a confirmation click, plus "Clear completed" to remove all finished tasks
- Filter by All / Active / Done and search across titles and notes
- Progress bar, per-filter counts, "N tasks left" footer and overdue highlighting
- Light and dark mode, responsive down to narrow window widths
- Tasks are stored locally in the WebView's `localStorage` under the key `task-manager.tasks.v1`




