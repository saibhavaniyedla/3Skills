import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get('/bookings/my')
      .then((res) => setBookings(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setBusyId(id);
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">Your registrations</span>
        <h1>My Bookings</h1>
        <p>Everything you've booked, in one place.</p>
      </div>

      {loading ? (
        <div className="page-loading">Loading bookings…</div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          You haven't booked any events yet. <Link to="/">Browse events →</Link>
        </div>
      ) : (
        <div className="table-wrap" style={{ marginBottom: 60 }}>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Location</th>
                <th>Seats</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>
                    <Link to={`/events/${b.event?.id}`} style={{ fontWeight: 600 }}>
                      {b.event?.title || 'Event removed'}
                    </Link>
                  </td>
                  <td>{b.event ? fmtDate(b.event.date) : '—'}</td>
                  <td>{b.event?.location || '—'}</td>
                  <td>{b.seats}</td>
                  <td>
                    <span className={`badge badge-${b.status}`}>{b.status}</span>
                  </td>
                  <td>
                    {['approved', 'pending'].includes(b.status) && (
                      <button className="btn btn-danger btn-sm" disabled={busyId === b.id} onClick={() => handleCancel(b.id)}>
                        {busyId === b.id ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
