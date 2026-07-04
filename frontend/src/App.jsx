import React, { useState } from 'react';

function App() {
  const [rawLog, setRawLog] = useState('');
  const [markdownResult, setMarkdownResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!rawLog.trim()) return;
    setLoading(true);
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
        {/* Custom Font applied to main heading */}
        <h1 className="text-3xl font-bold tracking-wide text-indigo-400 font-['Caveat']">📝 DevLog AI</h1>
        <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full">v1.0</span>
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 p-6 gap-6">
        {/* Left Input Pane (Messy Notes) */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            {/* Custom Font applied to sub-headings */}
            <h2 className="text-2xl font-bold tracking-wider text-slate-300 font-['Caveat']">Raw Input (Messy Notes)</h2>
            <button
              onClick={handleGenerate}
              disabled={loading || !rawLog}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 font-medium rounded-lg text-sm transition-colors"
            >
              {loading ? 'Processing...' : 'Structure Log ✨'}
            </button>
          </div>
          {/* Changed background to #caffbf and updated text to dark slate for high contrast */}
          <textarea
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            placeholder="Type your chaotic thoughts here..."
            className="w-full flex-1 p-4 bg-[#caffbf] text-slate-900 placeholder-slate-600 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm loading-relaxed"
          />
        </div>

        {/* Right Output Pane (Markdown Result) */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            {/* Custom Font applied to sub-headings */}
            <h2 className="text-2xl font-bold tracking-wider text-slate-300 font-['Caveat']">Generated Markdown</h2>
            {markdownResult && (
              <button
                onClick={downloadMarkdownFile}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 font-medium rounded-md text-xs transition-colors"
              >
                Download .md File
              </button>
            )}
          </div>
          {/* Changed background to #ffc6ff and updated text to dark slate for readability */}
          <div className="w-full flex-1 p-4 bg-[#ffc6ff] text-slate-900 border border-slate-700 rounded-xl font-mono text-sm overflow-y-auto whitespace-pre-wrap">
            {markdownResult || <span className="text-slate-600 italic">Your structured markdown will appear here...</span>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;