import { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const payload = { name: form.name, phone: form.phone };
      if (form.password) payload.password = form.password;
      const res = await api.put('/auth/profile', payload);
      updateUser(res.data.user);
      setMessage('Profile updated successfully.');
      setForm({ ...form, password: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="profile-grid">
        <div className="profile-side">
          <div className="avatar-circle">{user?.name?.[0]?.toUpperCase() || '?'}</div>
          <h3>{user?.name}</h3>
          <p style={{ fontSize: 13, color: '#6B6357', marginTop: 4 }}>{user?.email}</p>
          <p style={{ fontSize: 12, color: '#918A7B', marginTop: 10 }}>
            Member since {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: 4 }}>Edit profile</h2>
          <p className="form-sub">Update your personal details or password.</p>

          {message && <div className="form-success">{message}</div>}
          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
            <div className="field">
              <label>Full name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field">
              <label>Email (cannot be changed)</label>
              <input value={user?.email} disabled />
            </div>
            <div className="field">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="field">
              <label>New password (leave blank to keep current)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <button className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
