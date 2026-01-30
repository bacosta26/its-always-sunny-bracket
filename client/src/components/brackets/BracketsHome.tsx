import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bracketService } from '../../services/bracket.service';
import { Bracket } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const BracketsHome = () => {
  const navigate = useNavigate();
  const [brackets, setBrackets] = useState<Bracket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrackets = async () => {
      try {
        const data = await bracketService.getAllBrackets();
        setBrackets(data);
      } catch (error) {
        console.error('Failed to fetch brackets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrackets();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const earlyBracket = brackets.find(b => b.bracketGroup === 'early');
  const lateBracket = brackets.find(b => b.bracketGroup === 'late');

  return (
    <div className="container-custom py-12">
      <h1 className="text-4xl font-bold text-center mb-4">Episode Brackets</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Vote for your favorite It's Always Sunny in Philadelphia episodes in our tournament-style brackets!
      </p>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Early Seasons Bracket */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Seasons 1-8</h2>
            <p className="text-gray-600">The Classic Era</p>
          </div>

          {earlyBracket ? (
            <>
              <div className="mb-4">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    earlyBracket.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {earlyBracket.status === 'completed'
                    ? 'Complete'
                    : `Round ${earlyBracket.currentRound}`}
                </div>
              </div>

              <button
                onClick={() => navigate('/brackets/early')}
                className="btn-primary w-full"
              >
                {earlyBracket.status === 'completed' ? 'View Results' : 'Vote Now'}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Bracket not yet created</p>
            </div>
          )}
        </div>

        {/* Late Seasons Bracket */}
        <div className="card hover:shadow-lg transition-shadow">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Seasons 9-16</h2>
            <p className="text-gray-600">The Modern Era</p>
          </div>

          {lateBracket ? (
            <>
              <div className="mb-4">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    lateBracket.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {lateBracket.status === 'completed'
                    ? 'Complete'
                    : `Round ${lateBracket.currentRound}`}
                </div>
              </div>

              <button
                onClick={() => navigate('/brackets/late')}
                className="btn-primary w-full"
              >
                {lateBracket.status === 'completed' ? 'View Results' : 'Vote Now'}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Bracket not yet created</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="card max-w-2xl mx-auto mt-12 bg-gray-50">
        <h3 className="text-xl font-bold mb-4 text-center">How It Works</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">1️⃣</span>
            <span>Each bracket features episodes from its respective seasons</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">2️⃣</span>
            <span>Vote for your favorite episode in each matchup</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">3️⃣</span>
            <span>Winners advance to the next round</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">4️⃣</span>
            <span>Vote counts update live every 10 seconds</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">5️⃣</span>
            <span>The last episode standing becomes the champion!</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
