import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";

export default function Editor({ value, onChange, theme }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const valueRef = useRef(value);

  // Initialize Monaco Editor
  useEffect(() => {
    if (!containerRef.current) return;

    // Create the editor
    editorRef.current = monaco.editor.create(containerRef.current, {
      value: value,
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

  // Update editor value when prop changes from outside
  useEffect(() => {
    if (editorRef.current && value !== valueRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        editorRef.current.setValue(value);
        valueRef.current = value;
      }
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