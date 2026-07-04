import React, { useState } from 'react';

function App() {
  const [rawLog, setRawLog] = useState('');
  const [markdownResult, setMarkdownResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!rawLog.trim()) return;
    setLoading(true);
    setCopied(false);
    try {
      const response = await fetch('http://localhost:5000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawLog })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not process request.');
      }

      if (data.markdown) {
        setMarkdownResult(data.markdown);
      } else {
        setMarkdownResult('Could not process request.');
      }
    } catch (err) {
      setMarkdownResult(err.message || 'Failed to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async (e) => {
    if (!markdownResult) return;
    if (e) e.stopPropagation(); 
    try {
      await navigator.clipboard.writeText(markdownResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadMarkdownFile = () => {
    const element = document.createElement("a");
    const file = new Blob([markdownResult], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `dev-log-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="p-5 border-b border-slate-800 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-wide text-indigo-400 font-expressive">📝 DevLog AI</h1>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">v1.0</span>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 p-6 gap-6">
        {/* Left Input Pane (Messy Notes) */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center h-12 mb-2">
            <h2 className="text-2xl font-bold tracking-wider text-slate-300 font-expressive">Raw Input (Messy Notes)</h2>
            <button
              onClick={handleGenerate}
              disabled={loading || !rawLog}
              className="btn-monkey disabled:opacity-40 disabled:pointer-events-none"
            >
              {loading ? 'Processing...' : 'Structure Log ✨'}
            </button>
          </div>
          <textarea
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            placeholder="Type your chaotic thoughts here..."
            className="w-full flex-1 p-4 bg-[#caffbf] text-slate-900 placeholder-slate-600 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm leading-relaxed"
          />
        </div>

        {/* Right Output Pane (Markdown Result) */}
        <div className="flex flex-col space-y-4">
          {/* Flex layout fixes the layout, forcing proper spacing gap boundaries */}
          <div className="flex justify-between items-center h-12 mb-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-wider text-slate-300 font-expressive">
                Generated Markdown
              </h2>
              {copied && (
                <span className="text-xs text-emerald-400 px-2 py-1 bg-emerald-950/50 rounded-md font-mono normal-case tracking-normal">
                  Copied! 👍
                </span>
              )}
            </div>
            {markdownResult && (
              <button
                onClick={downloadMarkdownFile}
                className="btn-monkey"
              >
                Download .md File
              </button>
            )}
          </div>
          
          {/* Relative Container wrapper holding the absolute top-right copy button icon */}
          <div className="w-full flex-1 relative group">
            {markdownResult && (
              <button
                onClick={handleCopyText}
                title="Copy to clipboard"
                className="absolute top-3 right-3 z-10 p-2 bg-slate-900/10 hover:bg-slate-900/20 text-slate-700 active:scale-95 rounded-lg border border-slate-900/10 transition-all flex items-center justify-center shadow-sm"
              >
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                )}
              </button>
            )}

            <div 
              onClick={handleCopyText}
              className={`w-full h-full p-4 bg-[#ffc6ff] text-slate-900 border border-slate-700 rounded-xl font-mono text-sm overflow-y-auto whitespace-pre-wrap transition-all duration-200 ${
                markdownResult ? 'cursor-pointer hover:brightness-95' : ''
              }`}
            >
              {markdownResult || <span className="text-slate-600 italic">Your structured markdown will appear here...</span>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;