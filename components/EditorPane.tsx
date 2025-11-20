import React, { useRef, useEffect } from 'react';
import { Copy, Download, Trash2, FileCode } from 'lucide-react';

interface EditorPaneProps {
  title: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  actions?: React.ReactNode;
  errorLine?: number;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  title,
  value,
  onChange,
  readOnly = false,
  placeholder,
  actions,
  errorLine
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    // Could add toast here
  };

  const handleClear = () => {
    if (onChange) onChange('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300 font-medium">
          <FileCode className="w-4 h-4 text-indigo-400" />
          {title}
        </div>
        <div className="flex items-center gap-1">
          {actions}
          <button 
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!readOnly && (
            <button 
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors"
              title="Clear"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="relative flex-1 group">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          readOnly={readOnly}
          placeholder={placeholder}
          spellCheck={false}
          className={`
            w-full h-full p-4 bg-slate-950 text-slate-300 font-mono text-sm resize-none outline-none
            ${readOnly ? 'cursor-default' : 'cursor-text'}
            selection:bg-indigo-900/50 placeholder:text-slate-700
          `}
          style={{
            lineHeight: '1.5',
          }}
        />
      </div>
      
      {/* Footer / Status */}
      <div className="px-4 py-1.5 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 flex justify-between">
        <span>{value.length} chars</span>
        <span>{value.split('\n').length} lines</span>
      </div>
    </div>
  );
};