import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Login } from './components/auth/Login';
import { Register } from './components/auth/Register';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BracketsHome } from './components/brackets/BracketsHome';
import { BracketView } from './components/brackets/BracketView';
import { DraftsHome } from './components/draft/DraftsHome';
import { DraftBoard } from './components/draft/DraftBoard';

// Placeholder components
const Home = () => (
  <div className="container-custom py-12">
    <h1 className="text-4xl font-bold text-center mb-8">
      It's Always Sunny in Philadelphia - Episode Brackets
    </h1>
    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
      <div className="card text-center">
        <h2 className="text-2xl font-bold mb-4">Seasons 1-8 Bracket</h2>
        <p className="text-gray-600 mb-4">Vote for your favorite episodes from the early seasons</p>
        <a href="/brackets/early" className="btn-primary inline-block">View Bracket</a>
      </div>
      <div className="card text-center">
        <h2 className="text-2xl font-bold mb-4">Seasons 9-16 Bracket</h2>
        <p className="text-gray-600 mb-4">Vote for your favorite episodes from the later seasons</p>
        <a href="/brackets/late" className="btn-primary inline-block">View Bracket</a>
      </div>
    </div>
    <div className="card max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Fantasy Draft</h2>
      <p className="text-gray-600 text-center mb-4">
        Create leagues and draft episodes to compete with friends
      </p>
      <a href="/drafts" className="btn-secondary inline-block mx-auto block text-center">
        Go to Drafts
      </a>
    </div>
  </div>
);

const Admin = () => <div className="container-custom py-12"><h1 className="text-3xl font-bold">Admin Panel (Coming Soon)</h1></div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Toaster position="top-right" />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/brackets" element={<BracketsHome />} />
            <Route path="/brackets/:group" element={<BracketView />} />
            <Route path="/drafts" element={<DraftsHome />} />
            <Route path="/drafts/:id" element={<DraftBoard />} />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
