import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useCanvas } from '../hooks/useCanvas';
import { generateJavaScript, generateTypeScript, generatePython } from '../utils/exporter';

type Lang = 'javascript' | 'typescript' | 'python';
type ContentTab = 'code' | 'json';

const LANG_LABELS: Record<Lang, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
};

const LANG_EXTENSIONS: Record<Lang, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
};

const MONACO_LANGS: Record<Lang, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
};

export default function CodeEditorPanel({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { width, height, background, elements, exportState } = useCanvas();
  const [lang, setLang] = useState<Lang>('javascript');
  const [contentTab, setContentTab] = useState<ContentTab>('code');
  const [code, setCode] = useState('');

  const state = exportState();

  useEffect(() => {
    if (contentTab === 'json') {
      setCode(JSON.stringify(state, null, 2));
    } else {
      switch (lang) {
        case 'javascript':
          setCode(generateJavaScript(state));
          break;
        case 'typescript':
          setCode(generateTypeScript(state));
          break;
        case 'python':
          setCode(generatePython(state));
          break;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, contentTab, width, height, background, elements]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).catch(() => {});
  }, [code]);

  const handleDownload = useCallback(() => {
    const ext = contentTab === 'json' ? 'json' : LANG_EXTENSIONS[lang];
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `canvas.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, contentTab, lang]);

  const monacoLang = contentTab === 'json' ? 'json' : MONACO_LANGS[lang];

  return (
    <div
      className="flex flex-col border-t border-neutral-700 bg-neutral-900"
      style={{ height: collapsed ? '36px' : '300px', flexShrink: 0 }}
    >
      {/* Tab Bar */}
      <div className="flex items-center bg-neutral-800 border-b border-neutral-700 flex-shrink-0 h-9">
        {/* Content tabs */}
        <button
          onClick={() => setContentTab('code')}
          className={`px-3 py-1 text-xs border-r border-neutral-700 h-full transition ${
            contentTab === 'code' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Code
        </button>
        <button
          onClick={() => setContentTab('json')}
          className={`px-3 py-1 text-xs border-r border-neutral-700 h-full transition ${
            contentTab === 'json' ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:text-white'
          }`}
        >
          JSON
        </button>

        {/* Language tabs (only for code) */}
        {contentTab === 'code' && (
          <div className="flex border-r border-neutral-700">
            {(Object.keys(LANG_LABELS) as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 text-xs h-9 transition ${
                  lang === l ? 'bg-neutral-700 text-indigo-400' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />

        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="px-3 py-1 text-xs text-neutral-400 hover:text-white border-l border-neutral-700 h-full"
        >
          Copy
        </button>
        <button
          onClick={handleDownload}
          title="Download file"
          className="px-3 py-1 text-xs text-neutral-400 hover:text-white border-l border-neutral-700 h-full"
        >
          Download
        </button>
        <button
          onClick={onToggle}
          title={collapsed ? 'Expand' : 'Collapse'}
          className="px-3 py-1 text-xs text-neutral-400 hover:text-white border-l border-neutral-700 h-full"
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {/* Editor */}
      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={monacoLang}
            value={code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              lineNumbers: 'on',
              wordWrap: 'off',
              padding: { top: 8 },
            }}
          />
        </div>
      )}
    </div>
  );
}
