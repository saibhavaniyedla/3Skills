import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const load = () => api.get('/categories').then((res) => setCategories(res.data));

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, { name, description });
      } else {
        await api.post('/categories', { name, description });
      }
      resetForm();
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setName(c.name);
    setDescription(c.description || '');
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed. It may be in use by events.');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">Manage</span>
        <h1>Event Categories</h1>
        <p>Organize events into browsable categories like Workshop, Concert, or Conference.</p>
      </div>

      <div className="profile-grid" style={{ gridTemplateColumns: '320px 1fr' }}>
        <div className="card">
          <h2 style={{ fontSize: 17, marginBottom: 12 }}>{editingId ? 'Edit category' : 'Add category'}</h2>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Workshop" />
            </div>
            <div className="field">
              <label>Description (optional)</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {editingId && (
                <button type="button" className="btn btn-ghost" onClick={resetForm}>
                  Cancel
                </button>
              )}
              <button className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add category'}
              </button>
            </div>
          </form>
        </div>

        <div className="table-wrap" style={{ height: 'fit-content', marginBottom: 60 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.description || '—'}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(c)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: '#918A7B' }}>
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
