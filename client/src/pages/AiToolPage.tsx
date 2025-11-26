import { Link } from 'react-router-dom';
import { useAllChampions } from '../api/hooks';

export default function AiToolPage() {
  const { data } = useAllChampions();
  const champName = data ? Object.values(data.byId)[0]?.name : 'Aatrox';

  return (
    <div className="min-h-screen page-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">AI Tool Runner</h1>

        <p className="mb-4 text-neutral-300">This page runs the AI tool with prefilled parameters and logs the response to the console.</p>

        <button
          type="button"
          onClick={async () => {
            const API_BASE = import.meta.env.VITE_API_URL || '';
            const body = {
              model: 'gpt-oss-120b',
              messages: [
                { role: 'user', content: `Recommend an item build for ${champName}` },
              ],
              tools: [
                {
                  type: 'function',
                  function: {
                    name: 'generate_best_item',
                    description: 'Generate best item given context',
                    parameters: {
                      type: 'object',
                      properties: {
                        champion: { type: 'string' },
                        current_items: { type: 'array', items: { type: 'string' } },
                        gold: { type: 'integer' },
                        enemy_champions: { type: 'array', items: { type: 'string' } },
                        enemy_items: { type: 'array', items: { type: 'array', items: { type: 'string' } } },
                        game_time: { type: 'integer' }
                      }
                    }
                  }
                }
              ],
              tool_calls: [
                {
                  name: 'generate_best_item',
                  parameters: {
                    champion: champName,
                    current_items: [],
                    gold: 1200,
                    enemy_champions: [],
                    enemy_items: [],
                    game_time: 1200,
                  }
                }
              ]
            };

            try {
              const res = await fetch(`${API_BASE}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              });
              const json = await res.json();
              // Log to console
              console.log('AI tool response (AiToolPage):', json);
              alert('AI tool call completed — check console for results');
            } catch (err) {
              console.error('AI tool call failed', err);
              alert('AI tool call failed — see console');
            }
          }}
          className="px-4 py-2 rounded bg-secondary-600 text-white hover:bg-secondary-500"
        >
          Run AI Tool
        </button>

        <div className="mt-6">
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
