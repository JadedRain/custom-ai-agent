import { Link } from 'react-router-dom';

export default function ProPlayersPage() {
  // NA Pro Players - Replace tag lines with actual Riot IDs if these don't work
  const pros = [
    { name: 'Blaber', gameName: 'Blaber', tagLine: 'NA1' },
    { name: 'Doublelift', gameName: 'Doublelift', tagLine: 'NA1' },
    { name: 'Bjergsen', gameName: 'Bjergsen', tagLine: 'NA1' },
    { name: 'Impact', gameName: 'Impact', tagLine: 'NA1' },
    { name: 'CoreJJ', gameName: 'CoreJJ', tagLine: 'NA1' },
    { name: 'Jensen', gameName: 'Jensen', tagLine: 'NA1' },
    { name: 'Svenskeren', gameName: 'Svenskeren', tagLine: 'NA1' },
    { name: 'Sneaky', gameName: 'Sneaky', tagLine: 'NA1' },
  ];

  return (
    <div className="min-h-screen green-bg-dark text-white pt-20 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 green-text-light">Professional Players</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pros.map((pro) => (
            <Link
              key={pro.name}
              to={`/player/${pro.gameName}/${pro.tagLine}`}
              className="green-bg-medium border green-border rounded-lg p-4 hover:green-bg-light transition-colors"
            >
              <h2 className="text-xl font-semibold text-white">{pro.name}</h2>
              <p className="text-sm green-text mt-1">
                {pro.gameName}#{pro.tagLine}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
