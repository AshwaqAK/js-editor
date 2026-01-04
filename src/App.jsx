import { useEffect, useState } from "react";
import Editor from "./Editor";
import Console from "./Console";
import { themes } from "./themes";
import "./index.css";

/* ==================== LOCAL STORAGE KEYS ==================== */
const LS_CODE = "runjs_code";

/* ==================== DEFAULT CODE ==================== */
const DEFAULT_CODE = `// Welcome!
console.log("Hello World");`;

export default function App() {
  /* ==================== STATE ==================== */
  const [code, setCode] = useState(() => {
    return localStorage.getItem(LS_CODE) || DEFAULT_CODE;
  });

  const [logs, setLogs] = useState([]);
  const [themeName, setThemeName] = useState("dark");
  const [autoRun, setAutoRun] = useState(true);

  const theme = themes[themeName];

  /* ==================== PERSIST CODE ==================== */
  useEffect(() => {
    localStorage.setItem(LS_CODE, code);
  }, [code]);

  /* ==================== RUN CODE ==================== */
  const runCode = () => {
    setLogs([]);
    const collected = [];

    const safeSerialize = (value) => {
      if (typeof value === "string") return value;
  
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    };

    const fakeConsole = {
      log: (...args) => collected.push({ type: "log", payload: args.map(safeSerialize) }),
      warn: (...args) => collected.push({ type: "warn", payload: args.map(safeSerialize) }),
      error: (...args) => collected.push({ type: "error", payload: args.map(safeSerialize) }),
    };

    try {
      new Function("console", code)(fakeConsole);
      setLogs(collected);
    } catch (e) {
      setLogs([{ type: "error", payload: [e.toString()] }]);
    }
  };

  /* ==================== AUTO RUN ==================== */
  useEffect(() => {
    if (!autoRun) return;

    const timer = setTimeout(runCode, 500);
    return () => clearTimeout(timer);
  }, [code, autoRun]);

  /* ==================== RENDER ==================== */
  return (
    <div className={`app theme-${themeName}`}>
      {/* ===== Toolbar ===== */}
      <div className="toolbar">
         {/* Brand */}
        <div className="brand">
          AQ Editor
        </div>

        <div className="actions">
          <button className="btn-run" onClick={runCode}>
            ▶ Run
          </button>

          <label className="auto-run-toggle">
            <input
              type="checkbox"
              checked={autoRun}
              onChange={() => setAutoRun((v) => !v)}
            />
            <span className="slider" />
            <span className="label">Auto Run</span>
          </label>

          <button
            className="btn-theme"
            onClick={() =>
              setThemeName((t) => (t === "dark" ? "light" : "dark"))
            }
          >
            {themeName === "dark" ? "☀ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>

      {/* ===== Editor + Console ===== */}
      <div className="main-pane">
        <div className="editor-container">
          <Editor value={code} onChange={setCode} theme={theme.editor} />
        </div>

        <div className="console-container">
          <Console logs={logs} />
        </div>
      </div>
    </div>
  );
}
