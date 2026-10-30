import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login({ admin = false }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from || (admin ? '/admin' : '/');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (admin && user.role !== 'admin') {
        setError('This account does not have admin access.');
        return;
      }
      navigate(admin ? '/admin' : from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card">
      <span className="eyebrow">{admin ? 'Admin Access' : 'Welcome back'}</span>
      <h2>{admin ? 'Admin Login' : 'Log in to your account'}</h2>
      <p className="form-sub">{admin ? 'Manage events, bookings and users.' : 'Book events and manage your registrations.'}</p>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>
        <button className="btn btn-primary btn-block" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      {!admin && (
        <div className="form-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </div>
      )}
      {admin && (
        <div className="form-footer">
          <Link to="/login">Back to user login</Link>
        </div>
      )}
    </div>
  );
}
