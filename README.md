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

## Running

```sh
cargo tauri dev
```

If the Tauri CLI is installed, that's all you need — the app loads its frontend directly from `src/`. Alternatively, build and run the Rust shell directly:

```sh
cargo run --manifest-path src-tauri/Cargo.toml
```

The first build compiles all Rust dependencies and may take a few minutes.

## Project layout

- `src/index.html` — markup
- `src/styles.css` — styling, dark mode, responsive rules
- `src/main.js` — rendering and event wiring
- `src/tasks.js` — pure task logic (create, update, filter, sort, counts)
- `src/storage.js` — `localStorage` load/save with validation
- `src-tauri/` — Rust shell and Tauri configuration

## Recommended IDE setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)