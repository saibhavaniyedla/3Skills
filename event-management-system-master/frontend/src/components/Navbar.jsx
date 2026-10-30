import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">●</span> Gather
        </Link>

        {!isAdmin && (
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Events
            </NavLink>
            {user && (
              <>
                <NavLink to="/my-bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
                  My Bookings
                </NavLink>
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Profile
                </NavLink>
              </>
            )}
          </nav>
        )}

        {isAdmin && (
          <nav className="nav-links">
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Dashboard
            </NavLink>
            <NavLink to="/admin/events" className={({ isActive }) => (isActive ? 'active' : '')}>
              Events
            </NavLink>
            <NavLink to="/admin/categories" className={({ isActive }) => (isActive ? 'active' : '')}>
              Categories
            </NavLink>
            <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
              Bookings
            </NavLink>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'active' : '')}>
              Users
            </NavLink>
          </nav>
        )}

        <div className="navbar-actions">
          {user ? (
            <>
              <span className="user-chip">{user.name}{isAdmin ? ' · Admin' : ''}</span>
              <button className="btn btn-ghost" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
