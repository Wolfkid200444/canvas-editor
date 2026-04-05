import React, { useState } from 'react';
import CanvasEditor from './components/CanvasEditor';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import LayersPanel from './components/LayersPanel';
import CodeEditorPanel from './components/CodeEditorPanel';

export default function App() {
  const [codeCollapsed, setCodeCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-neutral-900 text-neutral-100 overflow-hidden">
      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Left toolbar */}
        <Toolbar />

        {/* Canvas */}
        <CanvasEditor />

        {/* Right panel */}
        <div className="flex flex-col w-[260px] flex-shrink-0 border-l border-neutral-700 overflow-hidden">
          <PropertiesPanel />
          <LayersPanel />
        </div>
      </div>

      {/* Bottom code panel */}
      <CodeEditorPanel
        collapsed={codeCollapsed}
        onToggle={() => setCodeCollapsed((v) => !v)}
      />
    </div>
  );
}
