"use client";

import { useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Button, Select, Spinner } from "@/components/ui";
import { Play, Send, RotateCcw } from "lucide-react";
import { api } from "@/lib/api-client";

interface Language {
  id: string;
  name: string;
  version: string;
  starterCode: string;
}

const LANGUAGES: Language[] = [
  {
    id: "python",
    name: "Python",
    version: "3.10.0",
    starterCode: `# Write your code here\n\ndef solution():\n    pass\n\nif __name__ == "__main__":\n    solution()`,
  },
  {
    id: "java",
    name: "Java",
    version: "15.0.2",
    starterCode: `// Write your code here\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}`,
  },
  {
    id: "cpp",
    name: "C++",
    version: "10.2.0",
    starterCode: `// Write your code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  },
  {
    id: "c",
    name: "C",
    version: "10.2.0",
    starterCode: `// Write your code here\n#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
  },
];

interface CodeEditorProps {
  questionId: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onSubmit?: (code: string, language: string) => void;
  readOnly?: boolean;
}

export function CodeEditor({
  questionId,
  initialCode,
  onCodeChange,
  onSubmit,
  readOnly,
}: CodeEditorProps) {
  const [language, setLanguage] = useState<Language>(LANGUAGES[0]);
  const [code, setCode] = useState(initialCode || language.starterCode);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLanguageChange = useCallback((langId: string) => {
    const newLang = LANGUAGES.find((l) => l.id === langId) || LANGUAGES[0];
    setLanguage(newLang);
    if (!initialCode) {
      setCode(newLang.starterCode);
    }
  }, [initialCode]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    onCodeChange?.(newCode);
  }, [onCodeChange]);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput("");

    try {
      const response = await api.execution.run({
        language: language.id,
        version: language.version,
        code,
        stdin: input,
      });

      if (response.success && response.data) {
        setOutput(response.data.output || response.data.error || "No output");
      } else {
        setOutput(response.error?.message || "Execution failed");
      }
    } catch (err) {
      setOutput("Error: Failed to execute code");
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;
    setIsSubmitting(true);
    try {
      await onSubmit(code, language.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCode(language.starterCode);
    setInput("");
    setOutput("");
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <Select
            value={language.id}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-32"
            disabled={readOnly}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </Select>
          <span className="text-xs text-muted-foreground">v{language.version}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={readOnly || isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRun}
            disabled={readOnly || isRunning}
          >
            {isRunning ? (
              <Spinner size="sm" className="mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Run
          </Button>
          {onSubmit && (
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={readOnly || isSubmitting}
            >
              {isSubmitting ? (
                <Spinner size="sm" className="mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Submit
            </Button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[300px]">
        <Editor
          height="100%"
          language={language.id === "cpp" ? "cpp" : language.id}
          value={code}
          onChange={handleCodeChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            tabSize: 4,
          }}
          loading={<div className="flex items-center justify-center h-full"><Spinner /></div>}
        />
      </div>

      {/* Input/Output Panel */}
      <div className="border-t">
        <div className="grid grid-cols-2 divide-x">
          <div className="p-2">
            <label className="text-xs font-medium text-muted-foreground">Input</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter input here..."
              className="w-full h-24 mt-1 p-2 text-sm font-mono bg-muted rounded resize-none focus:outline-none"
              disabled={readOnly}
            />
          </div>
          <div className="p-2">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            <pre className="w-full h-24 mt-1 p-2 text-sm font-mono bg-muted rounded overflow-auto whitespace-pre-wrap">
              {isRunning ? "Running..." : output || "Output will appear here..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
