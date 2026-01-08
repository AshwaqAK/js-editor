import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Editor({ value, onChange, theme, onMount }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const valueRef = useRef(value);

  useEffect(() => {
    if (!containerRef.current) return;

    /* ==================== ENABLE MODERN JS ==================== */
    monaco.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      lib: ["es2020", "dom"],
    });

    monaco.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    /* ==================== CREATE EDITOR ==================== */
    editorRef.current = monaco.editor.create(containerRef.current, {
      value,
      language: "javascript",
      theme: theme.name || "vs-dark",
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineNumbers: "on",
      scrollBeyondLastLine: false,
      wordWrap: "on",
      tabSize: 2,
    });

    /* ==================== EXPOSE TO PARENT ==================== */
    if (onMount) {
      onMount(editorRef.current, monaco);
    }

    /* ==================== CHANGE LISTENER ==================== */
    const disposable = editorRef.current.onDidChangeModelContent(() => {
      const newValue = editorRef.current.getValue();
      valueRef.current = newValue;
      onChange(newValue);
    });

    return () => {
      disposable.dispose();
      editorRef.current?.dispose();
    };
  }, []);

  /* ==================== SYNC VALUE ==================== */
  useEffect(() => {
    if (editorRef.current && value !== valueRef.current) {
      editorRef.current.setValue(value);
      valueRef.current = value;
    }
  }, [value]);

  /* ==================== THEME UPDATE ==================== */
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme.name || "vs-dark");
    }
  }, [theme]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
