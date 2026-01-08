import { useEffect, useState, useRef } from "react";
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

  const theme = themes[themeName];

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const workerRef = useRef(null);
  const timeoutRef = useRef(null);

  /* ==================== PERSIST CODE ==================== */
  useEffect(() => {
    localStorage.setItem(LS_CODE, code);
  }, [code]);

  /* ==================== RUN CODE (SAFE) ==================== */
  const runCode = (code) => {
    // Kill previous worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const worker = new Worker(
      new URL("./runner.worker.js", import.meta.url),
      { type: "module" }
    );

    workerRef.current = worker;

    // ⏱ Execution timeout (infinite loop protection)
    timeoutRef.current = setTimeout(() => {
      worker.terminate();
      workerRef.current = null;

      setLogs([
        {
          type: "error",
          payload: ["Execution timed out (possible infinite loop)"],
        },
      ]);
    }, 1000);

    worker.onmessage = (e) => {
      clearTimeout(timeoutRef.current);

      const { logs = [], error } = e.data;
      setLogs(logs);

      // Clear previous runtime markers
      if (editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();
        monacoRef.current.editor.setModelMarkers(model, "runtime", []);
      }

      // Highlight runtime error
      if (error && editorRef.current && monacoRef.current) {
        const model = editorRef.current.getModel();

        monacoRef.current.editor.setModelMarkers(model, "runtime", [
          {
            severity: monacoRef.current.MarkerSeverity.Error,
            message: error.message,
            startLineNumber: error.line || 1,
            startColumn: 1,
            endLineNumber: error.line || 1,
            endColumn: 100,
          },
        ]);

        editorRef.current.revealLineInCenter(error.line || 1);
      }
    };

    worker.onerror = () => {
      clearTimeout(timeoutRef.current);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage(code);
  };

  /* ==================== AUTO RUN (DEBOUNCED) ==================== */
  useEffect(() => {
    const timer = setTimeout(() => {
      runCode(code);
    }, 400);

    return () => clearTimeout(timer);
  }, [code]);

  /* ==================== CLEANUP ==================== */
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /* ==================== RENDER ==================== */
  return (
    <div className={`app theme-${themeName}`}>
      {/* ===== Toolbar ===== */}
      <div className="toolbar">
        <div className="brand">AQ Editor</div>

        <div className="actions">
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
          <Editor
            value={code}
            onChange={setCode}
            theme={theme.editor}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              monacoRef.current = monaco;
            }}
          />
        </div>

        <div className="console-container">
          <Console logs={logs} />
        </div>
      </div>
    </div>
  );
}
