import { useEffect, useState ,useRef} from "react";
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

  /* ==================== PERSIST CODE ==================== */
  useEffect(() => {
    localStorage.setItem(LS_CODE, code);
  }, [code]);

  /* ==================== AUTO RUN (ALWAYS ON) ==================== */
  useEffect(() => {
    const timer = setTimeout(() => {
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
    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelMarkers(model, "runtime", []);
    }
    
    try {
      new Function("console", code)(fakeConsole);
      setLogs(collected);
    } catch (e) {
      setLogs([{ type: "error", payload: [e.toString()] }]);
    
      if (!editorRef.current || !monacoRef.current) return;
    
      const model = editorRef.current.getModel();
    
      // Extract line number from stack trace
      const match = e.stack?.match(/<anonymous>:(\d+):\d+/);
      const lineNumber = match ? Number(match[1]) : 1;
    
      monacoRef.current.editor.setModelMarkers(model, "runtime", [
        {
          severity: monacoRef.current.MarkerSeverity.Error,
          message: e.message,
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 100,
        },
      ]);
    
      editorRef.current.revealLineInCenter(lineNumber);
    }
    }, 500); // debounce

    return () => clearTimeout(timer);
  }, [code]);

  /* ==================== RENDER ==================== */
  return (
    <div className={`app theme-${themeName}`}>
      {/* ===== Toolbar ===== */}
      <div className="toolbar">
        {/* Brand */}
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