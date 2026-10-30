import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/dashboard')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">Loading dashboard…</div>;

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">Overview</span>
        <h1>Admin Dashboard</h1>
        <p>A snapshot of everything happening across your events.</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalEvents}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-value">{stats.upcomingEvents}</div>
          <div className="stat-label">Upcoming Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalUsers}</div>
          <div className="stat-label">Registered Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalBookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeBookings}</div>
          <div className="stat-label">Active Bookings</div>
        </div>
      </div>

      <div className="section-header">
        <h2 style={{ fontSize: 18 }}>Recent bookings</h2>
        <Link to="/admin/bookings" className="btn btn-ghost btn-sm">
          View all
        </Link>
      </div>

      <div className="table-wrap" style={{ marginBottom: 60 }}>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Event</th>
              <th>Booked on</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentBookings.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: '#918A7B' }}>
                  No bookings yet.
                </td>
              </tr>
            )}
            {stats.recentBookings.map((b) => (
              <tr key={b.id}>
                <td>{b.user?.name || 'Deleted user'}</td>
                <td>{b.event?.title || 'Deleted event'}</td>
                <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`badge badge-${b.status}`}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
