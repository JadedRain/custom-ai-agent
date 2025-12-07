import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { API_BASE_URL } from '../api/client';
import { DDRAGON_VERSION } from '../config/constants';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { FaImage, FaTimes } from 'react-icons/fa';
import { useUserPreferences } from '../api/hooks';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  items?: Array<{ id: string; name: string }>;
  imageUrl?: string;
};

type AiChatProps = {
  itemData?: Record<string, unknown> | null;
};

export const AiChat: React.FC<AiChatProps> = ({ itemData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Array<{ id: string; name: string }>>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const auth = useAuth();
  const { data: userPrefs } = useUserPreferences();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !uploadedImage) || loading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input || 'Please analyze this image',
      imageUrl: uploadedImage || undefined
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentImage = uploadedImage;
    setInput('');
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setLoading(true);

    try {
      // Build comprehensive system prompt
      const buildPreference = userPrefs?.preference?.build_type || 'greedy';
      const buildPreferenceDescriptions = {
        greedy: 'Focus on gold generation, economy, and power spikes. Prioritize cost-efficient items that accelerate gold income.',
        defensive: 'Prioritize survivability, tankiness, and damage mitigation. Recommend armor, magic resist, and health items.',
        offensive: 'Maximize damage output and aggression. Prioritize damage, penetration, and attack speed items.'
      };
      
      const systemPrompt = `You are an expert League of Legends AI Assistant with deep knowledge of game mechanics, strategy, and meta analysis.

Your Expertise:
- Champion abilities, matchups, and optimal playstyles
- Item builds, gold efficiency, and power spikes  
- Lane management, wave control, and macro strategy
- Team composition analysis and win conditions
- Jungle pathing, objective control, and map awareness
- Advanced mechanics like animation canceling, ability combos
- Current meta trends and professional play strategies

Available Data:
- Complete champion database with roles, tags (Fighter, Mage, Tank, Assassin, Marksman, Support)
- Full item catalog with stats, costs, and build paths (14.23.1)
- Champion stats: attack, defense, magic, and difficulty ratings

User Build Preference: **${buildPreference.toUpperCase()}**
${buildPreferenceDescriptions[buildPreference as keyof typeof buildPreferenceDescriptions]}

When Analyzing Images (vision model):
- Identify champions, items, and game state from screenshots
- Analyze scoreboard data, gold differences, and power spikes
- Provide strategic advice based on visual information
- Suggest builds based on enemy team composition visible in screenshot

When Recommending Items:
- **ALWAYS prioritize the user's ${buildPreference} build preference** in all recommendations
- Always reference items by their 4-digit ID (e.g., 3153 for Blade of the Ruined King)
- Consider: enemy comp (AP/AD heavy), your champion role, game phase, gold efficiency
- Explain synergies with champion abilities and playstyle
- Suggest build paths and power spike timings
- Adapt recommendations to match ${buildPreference} playstyle

Response Style:
- Be concise and actionable
- Use markdown formatting for clarity
- Prioritize practical advice over theory
- Cite specific item IDs when recommending builds`;

      // Build message content - support multimodal if image is present
      let userMessageContent;
      if (currentImage) {
        userMessageContent = [
          { type: 'text', text: input || 'Please analyze this League of Legends screenshot and provide strategic advice.' },
          { type: 'image_url', image_url: { url: currentImage } }
        ];
      } else {
        userMessageContent = input;
      }

      // Use gemma3-27b for images, gpt-oss-120b for text only
      const modelToUse = currentImage ? 'gemma3-27b' : 'gpt-oss-120b';
      setCurrentModel(modelToUse);

      // Call AI API with system prompt
      const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.user?.access_token ? { 'Authorization': `Bearer ${auth.user.access_token}` } : {})
        },
        body: JSON.stringify({
          model: modelToUse,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessageContent }
          ],
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error:', response.status, errorText);
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI Response data:', data);
      
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
        assistantContent = 'I received your message but had trouble generating a response. Please try again.';
      }
      
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

      const formattedContent = assistantContent
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+/g, ' ')
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
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}${currentModel === 'gemma3-27b' ? ' (Vision model may be slow or unavailable)' : ''}`
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
      setCurrentModel(null);
    }
  };

  return (
    <div className="green-bg-medium green-border border rounded-lg p-3 md:p-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-3 md:gap-6 flex-1 min-h-0">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto mb-3 md:mb-4 space-y-2 md:space-y-3 min-h-0">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] md:max-w-[80%] rounded-lg p-3 md:p-4 ${
                    msg.role === 'user'
                      ? 'green-bg-light text-white'
                      : 'bg-neutral-700/50 text-neutral-100'
                  }`}
                >
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Uploaded" 
                      className="max-w-full rounded mb-3 max-h-48 md:max-h-64 object-contain"
                    />
                  )}
                  <div 
                    className="text-sm md:text-base max-w-none markdown-content"
                    dangerouslySetInnerHTML={{ 
                      __html: DOMPurify.sanitize(marked.parse(msg.content) as string)
                    }}
                  />
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-neutral-700/50 rounded-lg p-3 md:p-4">
                  <p className="text-sm md:text-base text-neutral-300">
                    {currentModel === 'gemma3-27b' 
                      ? 'Analyzing image... (this may take up to 2 minutes)' 
                      : 'Thinking...'}
                  </p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:gap-3">
            {uploadedImage && (
              <div className="relative inline-block max-w-full md:max-w-sm">
                <img 
                  src={uploadedImage} 
                  alt="Preview" 
                  className="max-h-40 md:max-h-48 rounded border green-border object-contain"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition-colors"
                  aria-label="Remove image"
                >
                  <FaTimes className="w-3 h-3 md:w-4 md:h-4" />
                </button>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-3 md:py-2 rounded green-bg-light hover:green-bg text-white font-medium transition-colors flex items-center justify-center gap-2 min-h-[44px] md:min-h-0 text-base md:text-sm"
                disabled={loading}
              >
                <FaImage className="w-4 h-4" />
                <span className="sm:inline">Upload Image</span>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about League of Legends..."
                className="flex-1 px-4 py-3 md:py-2 rounded bg-neutral-800 green-border border text-white placeholder-neutral-400 focus:outline-none focus:border-green-text text-base md:text-sm min-h-[44px] md:min-h-0"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || (!input.trim() && !uploadedImage)}
                className="px-5 md:px-6 py-3 md:py-2 rounded text-white font-medium transition-colors disabled:opacity-50 min-h-[44px] md:min-h-0 text-base md:text-sm whitespace-nowrap"
                style={{ backgroundColor: '#3d8b64' }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#4fa876')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#3d8b64')}
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {selectedItems.length > 0 && (
          <div className="w-full md:w-64 green-bg-light rounded-lg p-3 md:p-4 overflow-y-auto max-h-40 md:max-h-none">
            <h4 className="text-base md:text-lg font-semibold green-text mb-2 md:mb-3">Recommended Items</h4>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-neutral-800/30 rounded">
                  <img
                    src={`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/item/${item.id}.png`}
                    alt={item.name}
                    className="w-10 h-10 md:w-12 md:h-12 rounded flex-shrink-0"
                  />
                  <span className="text-sm md:text-base text-white truncate">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
