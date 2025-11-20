import React, { useState, useCallback, useRef } from 'react';
import { EditorPane } from './components/EditorPane';
import { Button } from './components/Button';
import { 
  Code2, 
  Wand2, 
  Minimize2, 
  FileJson, 
  Upload, 
  AlertCircle,
  CheckCircle2,
  Bot,
  Sparkles,
  Download
} from 'lucide-react';
import { StatusType, ViewMode, XmlError } from './types';
import { formatXml, minifyXml, validateXml, downloadFile } from './services/xmlService';
import { smartFixXml, convertXmlToJson, generateSampleXml } from './services/geminiService';

export default function App() {
  const [inputXml, setInputXml] = useState<string>('');
  const [outputContent, setOutputContent] = useState<string>('');
  const [status, setStatus] = useState<StatusType>(StatusType.IDLE);
  const [message, setMessage] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.XML);
  const [validationError, setValidationError] = useState<XmlError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormat = useCallback(() => {
    if (!inputXml.trim()) return;
    
    // First validate
    const error = validateXml(inputXml);
    setValidationError(error);

    if (error) {
      setStatus(StatusType.ERROR);
      setMessage(`Invalid XML: ${error.message}`);
      return;
    }

    try {
      const formatted = formatXml(inputXml);
      setOutputContent(formatted);
      setViewMode(ViewMode.XML);
      setStatus(StatusType.SUCCESS);
      setMessage('XML formatted successfully');
    } catch (e) {
      setStatus(StatusType.ERROR);
      setMessage('Formatting failed');
    }
  }, [inputXml]);

  const handleMinify = useCallback(() => {
    if (!inputXml.trim()) return;
    const error = validateXml(inputXml);
    if (error) {
      setValidationError(error);
      setStatus(StatusType.ERROR);
      setMessage('Cannot minify invalid XML');
      return;
    }
    setValidationError(null);
    setOutputContent(minifyXml(inputXml));
    setViewMode(ViewMode.XML);
    setStatus(StatusType.SUCCESS);
    setMessage('XML minified');
  }, [inputXml]);

  const handleSmartFix = async () => {
    if (!inputXml.trim()) return;
    
    setStatus(StatusType.LOADING);
    setMessage('AI is analyzing and repairing your XML...');
    
    try {
      const fixed = await smartFixXml(inputXml);
      setInputXml(fixed); // Update input with fixed version
      setOutputContent(formatXml(fixed)); // Format the fixed version
      setValidationError(null);
      setStatus(StatusType.SUCCESS);
      setMessage('XML repaired by Gemini AI');
    } catch (e) {
      setStatus(StatusType.ERROR);
      setMessage('AI Repair failed. Please check your API Key.');
    }
  };

  const handleConvertToJSON = async () => {
    if (!inputXml.trim()) return;

    setStatus(StatusType.LOADING);
    setMessage('AI is converting XML to JSON...');

    try {
      const json = await convertXmlToJson(inputXml);
      setOutputContent(json);
      setViewMode(ViewMode.JSON);
      setStatus(StatusType.SUCCESS);
      setMessage('Converted to JSON successfully');
    } catch (e) {
      setStatus(StatusType.ERROR);
      setMessage('Conversion failed');
    }
  };

  const handleGenerateSample = async () => {
    setStatus(StatusType.LOADING);
    setMessage('Generating sample data...');
    try {
      const sample = await generateSampleXml();
      setInputXml(sample);
      setOutputContent('');
      setValidationError(null);
      setStatus(StatusType.IDLE);
      setMessage('Sample loaded');
    } catch (e) {
      setStatus(StatusType.ERROR);
      setMessage('Failed to generate sample');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputXml(content);
      // Auto format on load
      try {
        if (!validateXml(content)) {
            setOutputContent(formatXml(content));
        }
      } catch {}
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!outputContent) return;
    const ext = viewMode === ViewMode.JSON ? 'json' : 'xml';
    const type = viewMode === ViewMode.JSON ? 'application/json' : 'application/xml';
    downloadFile(outputContent, `formatted.${ext}`, type);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200 font-sans">
      
      {/* Navigation / Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">XML Master Studio</h1>
              <p className="text-xs text-slate-400 font-mono">Formatter & AI Tools</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="secondary" 
              onClick={handleGenerateSample} 
              isLoading={status === StatusType.LOADING && message.includes('Generating')}
              icon={<Sparkles className="w-4 h-4 text-amber-400"/>}
            >
              Generate Sample
            </Button>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-slate-950 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          
          <div className="flex items-center gap-2 mr-4 border-r border-slate-800 pr-4">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".xml,.txt"
            />
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()} icon={<Upload className="w-4 h-4"/>}>
              Upload XML
            </Button>
          </div>

          <Button onClick={handleFormat} icon={<Wand2 className="w-4 h-4"/>}>
            Format / Beautify
          </Button>
          
          <Button variant="secondary" onClick={handleMinify} icon={<Minimize2 className="w-4 h-4"/>}>
            Minify
          </Button>
          
          <div className="w-px h-8 bg-slate-800 mx-2 hidden md:block"></div>

          <Button 
            variant="secondary" 
            onClick={handleSmartFix} 
            disabled={!validationError && inputXml.length > 0}
            isLoading={status === StatusType.LOADING && message.includes('repairing')}
            className={validationError ? 'ring-2 ring-red-500 border-red-500 text-red-400' : ''}
            icon={<Bot className="w-4 h-4"/>}
          >
            Smart Fix (AI)
          </Button>

          <Button 
            variant="secondary" 
            onClick={handleConvertToJSON}
            isLoading={status === StatusType.LOADING && message.includes('converting')}
            icon={<FileJson className="w-4 h-4"/>}
          >
            XML to JSON
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {message && (
        <div className={`
          px-4 py-2 text-sm font-medium flex items-center justify-center gap-2
          ${status === StatusType.ERROR ? 'bg-red-500/10 text-red-400' : ''}
          ${status === StatusType.SUCCESS ? 'bg-green-500/10 text-green-400' : ''}
          ${status === StatusType.LOADING ? 'bg-indigo-500/10 text-indigo-400' : ''}
        `}>
          {status === StatusType.ERROR && <AlertCircle className="w-4 h-4" />}
          {status === StatusType.SUCCESS && <CheckCircle2 className="w-4 h-4" />}
          {status === StatusType.LOADING && <Loader2 className="w-4 h-4 animate-spin" />}
          {message}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-220px)] min-h-[500px]">
          
          {/* Left: Input */}
          <EditorPane 
            title="XML Input" 
            value={inputXml} 
            onChange={setInputXml} 
            placeholder="Paste your XML here..."
            errorLine={validationError?.line}
          />

          {/* Right: Output */}
          <EditorPane 
            title={viewMode === ViewMode.JSON ? "JSON Output" : "XML Output"}
            value={outputContent}
            readOnly={true}
            placeholder="Formatted result will appear here..."
            actions={
              outputContent && (
                <button 
                  onClick={handleDownload}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors mr-1"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </button>
              )
            }
          />

        </div>
      </main>

    </div>
  );
}

// Helper for the status bar icon
function Loader2({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}