import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(email, username, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-purple-900 to-black relative overflow-hidden">
      {/* Stage curtains effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-red-900 to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-900 to-transparent"></div>
      </div>

      {/* Spotlight effect */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-yellow-300 rounded-full opacity-10 blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Theatrical Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 mb-2 font-serif">
            Join The Cast
          </h1>
          <p className="text-yellow-200 italic text-sm">Become Part of the Show</p>
          <div className="flex justify-center gap-2 mt-4">
            <span className="text-3xl">🎪</span>
            <span className="text-3xl">🎭</span>
            <span className="text-3xl">🎬</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl border-4 border-yellow-500 p-8 backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-6 text-yellow-300 font-serif">
            Get Your Ticket
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-yellow-200 text-sm font-bold mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-yellow-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-yellow-200 text-sm font-bold mb-2">
                👤 Stage Name (Username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-yellow-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="CharlieDayMan"
                minLength={3}
                required
              />
            </div>

            <div>
              <label className="block text-yellow-200 text-sm font-bold mb-2">
                🔐 Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border-2 border-yellow-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                ⚡ Minimum 8 characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-gray-900 font-bold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? '🎭 Creating Account...' : '🎟️ Join the Show'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 mb-2">Already in the cast?</p>
            <Link
              to="/login"
              className="text-yellow-300 hover:text-yellow-400 font-bold underline text-lg transition-colors"
            >
              Return to Stage 🎬
            </Link>
          </div>
        </div>

        {/* Theatrical footer */}
        <div className="text-center mt-8 text-gray-400 text-sm italic">
          <p>"Fighter of the Nightman, champion of the sun!" ☀️</p>
        </div>
      </div>

      {/* Animated stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300 opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 10 + 10}px`,
            }}
          >
            ✨
          </div>
        ))}
      </div>
    </div>
  );
};
