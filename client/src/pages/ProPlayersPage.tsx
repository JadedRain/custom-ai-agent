import { Link } from 'react-router-dom';

export default function ProPlayersPage() {
  const pros = [
    'Faker',
    'Doublelift',
    'Uzi',
    'Perkz',
    'Bjergsen',
    'Rekkles',
    'TheShy',
    'Caps',
  ];

  return (
    <div className="min-h-screen page-bg p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Professional Players</h1>
        <ul className="list-disc list-inside space-y-2 text-neutral-200">
          {pros.map((p) => (
            <li key={p} className="text-lg">{p}</li>
          ))}
        </ul>

        <div className="mt-6">
          <Link to="/">Home</Link>
        </div>
      </div>
    </div>
  );
}
