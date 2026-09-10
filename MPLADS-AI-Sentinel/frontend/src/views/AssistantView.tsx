import React, { useState } from 'react';
import { api } from '../services/api';
import { MessageSquareCode, Send, Bot, User as UserIcon, Code2, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  data?: any[];
  sql?: string;
}

export const AssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Namaste! I am the MPLADS Intelligence Assistant. Ask me questions like "Which projects have the highest risk?", "Show delayed projects in Maharashtra", or "Which projects have progress mismatches?".'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const presetQuestions = [
    'Which projects have the highest risk?',
    'Show delayed projects in Maharashtra',
    'Which projects have cost overruns above 20%?',
    'Show projects with high financial progress but low physical progress'
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: q }]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/query', { query: q });
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: res.data.answer,
          data: res.data.data,
          sql: res.data.sql_equivalent
        }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Error connecting to Intelligence Assistant engine.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
          <MessageSquareCode className="w-5 h-5 text-indigo-400" />
          <span>MPLADS Intelligence Assistant</span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">Natural language query engine converting plain text questions into database analytics queries</p>
      </div>

      {/* Preset Questions */}
      <div className="flex flex-wrap gap-2">
        {presetQuestions.map((pq, i) => (
          <button
            key={i}
            onClick={() => handleSend(pq)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs rounded-lg border border-slate-700 transition"
          >
            "{pq}"
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl h-[480px] overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="p-2 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 rounded-xl">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-xl p-4 rounded-2xl text-xs space-y-2 ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white rounded-tr-none'
                : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none'
            }`}>
              <p className="leading-relaxed">{msg.text}</p>

              {/* Data Table Result */}
              {msg.data && msg.data.length > 0 && (
                <div className="mt-3 bg-slate-950/60 p-3 rounded-xl border border-slate-800 overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="text-slate-400 border-b border-slate-800">
                      <tr>
                        {Object.keys(msg.data[0]).map((k) => (
                          <th key={k} className="p-1.5 capitalize">{k.replace('_', ' ')}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {msg.data.map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val: any, vIdx) => (
                            <td key={vIdx} className="p-1.5">{String(val)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SQL Equivalent */}
              {msg.sql && (
                <div className="mt-2 text-[10px] font-mono text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800 flex items-center space-x-2">
                  <Code2 className="w-3 h-3 text-slate-500 flex-shrink-0" />
                  <span>{msg.sql}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="p-2 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2 text-xs text-slate-400 p-2">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Assistant parsing intent...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-lg"
      >
        <input
          type="text"
          placeholder="Ask a question about MPLADS projects, funds, delays, or risk anomalies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-lg transition flex items-center space-x-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </form>
    </div>
  );
};
