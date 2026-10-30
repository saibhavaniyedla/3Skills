import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/admin/users')
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleStatus = async (u) => {
    setBusyId(u.id);
    try {
      await api.put(`/admin/users/${u.id}/status`, { status: u.status === 'active' ? 'blocked' : 'active' });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? Their bookings will also be removed.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">Manage</span>
        <h1>Users</h1>
        <p>View, block, or remove registered users.</p>
      </div>

      {loading ? (
        <div className="page-loading">Loading users…</div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: 60 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Joined</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${u.status}`}>{u.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" disabled={busyId === u.id} onClick={() => toggleStatus(u)}>
                      {u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#918A7B' }}>
                    No users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
