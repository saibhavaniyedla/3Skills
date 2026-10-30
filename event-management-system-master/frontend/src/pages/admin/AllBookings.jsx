import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/bookings')
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatus = async (id, status) => {
    setBusyId(id);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed.');
    } finally {
      setBusyId(null);
    }
  };

  const visible = filter ? bookings.filter((b) => b.status === filter) : bookings;

  return (
    <div className="container">
      <div className="section-header" style={{ marginTop: 32 }}>
        <div>
          <span className="eyebrow">Manage</span>
          <h1>All Bookings</h1>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 180 }}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="page-loading">Loading bookings…</div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: 60 }}>
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Event</th>
                <th>Seats</th>
                <th>Booked on</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((b) => (
                <tr key={b.id}>
                  <td>
                    {b.user?.name || 'Deleted user'}
                    <div style={{ fontSize: 12, color: '#918A7B' }}>{b.user?.email}</div>
                  </td>
                  <td>{b.event?.title || 'Deleted event'}</td>
                  <td>{b.seats}</td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    {b.status === 'pending' && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={busyId === b.id}
                          onClick={() => handleStatus(b.id, 'approved')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={busyId === b.id}
                          onClick={() => handleStatus(b.id, 'rejected')}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#918A7B' }}>
                    No bookings found.
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
