import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Editor({ value, onChange, theme, onMount }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const valueRef = useRef(value);

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return;

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

    // 🔥 Expose editor + monaco to parent
    if (onMount) {
      onMount(editorRef.current, monaco);
    }

    // Listen for content changes
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

  // Update editor value when prop changes
  useEffect(() => {
    if (editorRef.current && value !== valueRef.current) {
      editorRef.current.setValue(value);
      valueRef.current = value;
    }
  }, [value]);

  // Update theme when it changes
  useEffect(() => {
    if (editorRef.current) {
      monaco.editor.setTheme(theme.name || "vs-dark");
    }
  }, [theme]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%" }} />;
}
