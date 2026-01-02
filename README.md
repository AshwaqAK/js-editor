# RunJS Web – Browser-Based JavaScript Playground

A lightweight, browser-based JavaScript playground inspired by **RunJS**.  
Built entirely with **React**, this app lets you write, run, and experiment with JavaScript instantly — without installing anything or paying for subscriptions.

---

## ✨ Features

- 🧠 **Monaco Editor** (VS Code–like editing experience)
- ▶️ **Run JavaScript in-browser** using Web Workers
- 🪵 **Pretty console output**
  - `console.log`
  - `console.warn`
  - `console.error`
  - `console.table`
- 📑 **Multiple snippets / tabs**
  - Create, switch, and rename snippets
  - Each snippet auto-saves
- 💾 **Persistent workspace**
  - Code, snippets, theme, and settings saved via `localStorage`
- ⌨️ **Keyboard shortcuts**
  - `Ctrl / Cmd + Enter` → Run code
  - `Ctrl / Cmd + L` → Clear console
- 🔁 **Auto-run mode**
- 🎨 **Light / Dark theme**
- 📱 **Responsive UI**
  - Works on desktop and mobile

---

## 🚀 Live Workflow

1. Write JavaScript in the editor
2. Click **Run** or press `Cmd / Ctrl + Enter`
3. View output in the console
4. Switch between snippets instantly
5. Refresh the page — your work is still there

---

## 🛠️ Tech Stack

- **React**
- **Monaco Editor**
- **Web Workers**
- **CSS (custom theming)**
- **Vite** (build tool)

---

## 📂 Project Structure

```text
src/
├── App.jsx            # Main application logic
├── Editor.jsx         # Monaco editor wrapper
├── Console.jsx        # Custom console renderer
├── runner.worker.js   # JavaScript sandbox (Web Worker)
├── themes.js          # Editor themes
├── index.css          # Global styles & theming
└── main.jsx
