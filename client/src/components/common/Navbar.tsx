import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-sunny-dark text-white shadow-lg">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-sunny-yellow">
            Sunny Brackets
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/brackets" className="hover:text-sunny-yellow transition">
              Brackets
            </Link>
            <Link to="/drafts" className="hover:text-sunny-yellow transition">
              Drafts
            </Link>

            {user ? (
              <>
                {user.isAdmin && (
                  <Link to="/admin" className="hover:text-sunny-yellow transition">
                    Admin
                  </Link>
                )}
                <span className="text-gray-300">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="bg-sunny-yellow text-gray-900 px-4 py-2 rounded hover:bg-yellow-500 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="hover:text-sunny-yellow transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-sunny-yellow text-gray-900 px-4 py-2 rounded hover:bg-yellow-500 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
