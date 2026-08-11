import React, { useState, useEffect, useRef } from 'react';
import { useWellness } from '../context/WellnessContext';
import { api } from '../services/api';
import { ChatMessage } from '../types';
import { Bot, Send, X, AlertCircle, RefreshCw } from 'lucide-react';

export const AskMindaModal: React.FC = () => {
  const { isMindaOpen, setIsMindaOpen, profile } = useWellness();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMindaOpen && profile) {
      loadHistory();
    }
  }, [isMindaOpen, profile]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadHistory = async () => {
    if (!profile) return;
    setLoadingHistory(true);
    try {
      const history = await api.getChatHistory(profile.id);
      if (history.length === 0) {
        setMessages([
          {
            id: 'welcome',
            profile_id: profile.id,
            sender: 'minda',
            text: `Hello ${profile.display_name}! I am Minda, your AI Mental Wellness Assistant. I am here to provide gentle encouragement, stress-relief ideas, or a quiet listening ear. How can I support your calm today?`,
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setMessages(history);
      }
    } catch (err) {
      console.error('Error loading Minda history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || !profile || sending) return;

    const userMsgText = text.trim();
    if (!textToSend) setInputText('');

    const userMsg: ChatMessage = {
      id: 'temp_user_' + Date.now(),
      profile_id: profile.id,
      sender: 'user',
      text: userMsgText,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const reply = await api.sendChatMessage(profile.id, userMsgText);
      setMessages(prev => [...prev.filter(m => m.id !== userMsg.id), userMsg, reply]);
    } catch (err: any) {
      const fallbackMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        profile_id: profile.id,
        sender: 'minda',
        text: err.message || 'Minda is temporarily resting. You can still explore meditation, journaling, and relaxation tools!',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setSending(false);
    }
  };

  if (!isMindaOpen) return null;

  const quickPrompts = [
    'I am feeling stressed today',
    'Give me a 2-minute breathing exercise',
    'Suggest a reflective journal prompt',
    'How can I sleep better tonight?'
  ];

  return (
    <div className="fixed inset-x-3 bottom-3 sm:bottom-6 sm:right-6 sm:left-auto z-50 w-auto sm:w-[420px] max-h-[calc(100vh-5rem)] h-[560px] pointer-events-none animate-in slide-in-from-bottom-5 duration-200">
      <div className="w-full h-full glass-modal rounded-3xl shadow-2xl border border-slate-300/40 flex flex-col overflow-hidden pointer-events-auto">
        {/* Header */}
        <div className="theme-hero-card p-3.5 border-b border-slate-200/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 theme-text-accent border theme-border-accent flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm tracking-tight opacity-95">Minda AI Assistant</h3>
                <span className="w-2 h-2 rounded-full theme-bg-accent" />
              </div>
              <p className="text-[11px] opacity-75 font-medium">Your supportive wellness companion</p>
            </div>
          </div>

          <button
            onClick={() => setIsMindaOpen(false)}
            className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 opacity-70 hover:opacity-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Disclaimer banner */}
        <div className="bg-amber-500/10 px-3.5 py-1.5 border-b border-amber-500/20 flex items-center gap-2 text-[10px] text-amber-600 dark:text-amber-300 font-medium shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Minda is a wellness assistant, not a doctor. In emergency call 988/911.</span>
        </div>

        {/* Message stream */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 touch-scroll">
          {loadingHistory ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-xs gap-2">
              <RefreshCw className="w-4 h-4 animate-spin theme-text-accent" />
              <span>Connecting to Minda...</span>
            </div>
          ) : (
            (Array.isArray(messages) ? messages : []).map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[88%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {!isUser && (
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/10 border theme-border-accent theme-text-accent flex items-center justify-center text-xs shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'theme-gradient-btn text-white rounded-tr-xs shadow-sm font-medium'
                          : 'glass-card border border-slate-300/40 rounded-tl-xs shadow-sm font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 glass-card border border-slate-300/40 px-3.5 py-2 rounded-2xl text-xs font-medium shadow-sm">
                <Bot className="w-4 h-4 theme-text-accent animate-spin" />
                <span>Minda is thinking softly...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick starter buttons */}
        <div className="px-3 py-2 border-t border-slate-200/40 flex gap-1.5 overflow-x-auto touch-scroll shrink-0 bg-black/5 dark:bg-white/5">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              disabled={sending}
              className="px-2.5 py-1 text-[11px] font-medium glass-card hover:bg-white/20 opacity-80 hover:opacity-100 rounded-xl whitespace-nowrap transition border border-slate-300/40"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-3 border-t border-slate-200/40 shrink-0 bg-black/5 dark:bg-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask Minda anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sending}
              className="flex-1 px-3.5 py-2 rounded-2xl glass-card border border-slate-300/40 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="p-2.5 theme-gradient-btn text-white rounded-2xl transition disabled:opacity-40 shadow-sm shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
