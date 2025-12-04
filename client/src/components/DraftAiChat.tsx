import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from '../api/client';
import { DDRAGON_VERSION } from '../config/constants';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  items?: Array<{ id: string; name: string }>;
};

type DraftAiChatProps = {
  leftTeam: Array<{ id?: string; name?: string }>;
  rightTeam: Array<{ id?: string; name?: string }>;
  itemData: Record<string, unknown> | null;
  selectedChampion?: { id?: number; name?: string };
  userSide?: 'left' | 'right';
};

export const DraftAiChat: React.FC<DraftAiChatProps> = ({ leftTeam, rightTeam, itemData, selectedChampion, userSide }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; name: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build context with selected champion as primary focus
      const myTeam = userSide === 'left' ? leftTeam : rightTeam;
      const enemyTeam = userSide === 'left' ? rightTeam : leftTeam;
      
      const contextParts = [];
      if (selectedChampion?.name) {
        contextParts.push(`Playing as: ${selectedChampion.name}`);
      }
      const myChampions = myTeam.filter(c => c.name && c.name !== selectedChampion?.name).map(c => c.name).join(', ');
      if (myChampions) {
        contextParts.push(`Teammates: ${myChampions}`);
      }
      const enemyChampions = enemyTeam.filter(c => c.name).map(c => c.name).join(', ');
      if (enemyChampions) {
        contextParts.push(`Enemy Team: ${enemyChampions}`);
      }
      
      const contextMessage = contextParts.length > 0
        ? `${contextParts.join('\n')}\n\nQuestion: ${input}`
        : input;

      // Call AI API - don't include tool_calls to get a normal chat response
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.user?.access_token ? { 'Authorization': `Bearer ${auth.user.access_token}` } : {})
        },
        body: JSON.stringify({
          model: 'gpt-oss-120b',
          messages: [{ role: 'user', content: contextMessage }],
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error:', response.status, errorText);
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response data:', data);
      
      // Extract content from OpenAI-style response
      let assistantContent = '';
      if (data.choices && data.choices[0]?.message?.content) {
        assistantContent = data.choices[0].message.content;
      } else if (data.response) {
        assistantContent = data.response;
      } else if (data.content) {
        assistantContent = data.content;
      } else if (data.message) {
        assistantContent = data.message;
      } else {
        // Don't show raw JSON, show a friendly message
        assistantContent = 'I received your message but had trouble generating a response. Please try again.';
      }
      
      // Extract item recommendations if present
      const itemMatches = assistantContent.match(/\b\d{4}\b/g) || [];
      const recommendedItems: Array<{ id: string; name: string }> = [];
      
      if (itemData) {
        itemMatches.forEach((id: string) => {
          const item = itemData[id] as Record<string, unknown> | undefined;
          if (item?.name) {
            recommendedItems.push({ id, name: String(item.name) });
          }
        });
      }

      // Format the content: clean up extra whitespace and improve readability
      const formattedContent = assistantContent
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with 2
        .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
        .trim();

      const assistantMessage: Message = {
        role: 'assistant',
        content: formattedContent,
        items: recommendedItems.length > 0 ? recommendedItems : undefined
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (recommendedItems.length > 0) {
        setSelectedItems(recommendedItems);
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="green-bg-medium green-border border rounded-lg p-3 h-full flex flex-col">
      <h3 className="text-sm font-semibold green-text-light mb-2">Draft Assistant</h3>
      
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto mb-2 space-y-1.5 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-2 ${
                    msg.role === 'user'
                      ? 'green-bg-light text-white'
                      : 'bg-neutral-700/50 text-neutral-100'
                  }`}
                >
                  <div 
                    className="text-xs max-w-none markdown-content"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(marked.parse(msg.content) as string)
                    }}
                    style={{
                      fontSize: '0.75rem',
                      lineHeight: '1.5',
                    }}
                  />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-700/50 rounded-lg p-2">
                  <p className="text-xs text-neutral-300">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about builds, matchups, or strategy..."
              className="flex-1 px-2 py-1.5 rounded bg-neutral-800 green-border border text-white placeholder-neutral-400 text-xs focus:outline-none focus:border-green-text"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-3 py-1.5 rounded text-white text-xs font-medium transition-colors disabled:opacity-50"
              style={{ backgroundColor: '#3d8b64' }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4fa876')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3d8b64')}
            >
              Send
            </button>
          </form>
        </div>

        {/* Item recommendations panel */}
        {selectedItems.length > 0 && (
          <div className="w-36 green-bg-light rounded-lg p-2 overflow-y-auto">
            <h4 className="text-xs font-semibold green-text mb-1.5">Items</h4>
            <div className="space-y-1.5">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-1.5 p-1.5 bg-neutral-800/30 rounded">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${item.id}.png`}
                    alt={item.name}
                    className="w-6 h-6 rounded"
                  />
                  <span className="text-xs text-white truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
