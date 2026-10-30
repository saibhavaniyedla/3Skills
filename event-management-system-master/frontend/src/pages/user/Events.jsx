import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export default function Events() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [from, setFrom] = useState('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;
      if (from) params.from = from;
      const res = await api.get('/events', { params });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    const t = setTimeout(fetchEvents, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, category, from]);

  return (
    <div className="container">
      <div className="page-header">
        <span className="eyebrow">Upcoming</span>
        <h1>Find your next event</h1>
        <p>Browse conferences, workshops, concerts and more — search, filter and book in a few taps.</p>
      </div>

      <div className="filter-bar">
        <input placeholder="Search by name, location…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        {(q || category || from) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setQ('');
              setCategory('');
              setFrom('');
            }}
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading">Loading events…</div>
      ) : events.length === 0 ? (
        <div className="empty-state">No events match your search. Try different filters.</div>
      ) : (
        <div className="event-grid">
          {events.map((ev) => {
            const seatsLeft = ev.capacity - (ev.bookedCount || 0);
            return (
              <Link to={`/events/${ev.id}`} className="event-card" key={ev.id}>
                <div className="event-card-media">
                  {ev.imageUrl && <img src={ev.imageUrl} alt={ev.title} />}
                  <span className="event-cat-tag">{ev.category?.name || 'General'}</span>
                </div>
                <div className="event-card-body">
                  <h3>{ev.title}</h3>
                  <div className="event-meta">
                    <span>📅 {fmtDate(ev.date)} {ev.time && `· ${ev.time}`}</span>
                    <span>📍 {ev.location}</span>
                  </div>
                  <div className="event-card-footer">
                    <span className="event-price">{ev.price > 0 ? `₹${ev.price}` : 'Free'}</span>
                    <span className="seats-left">{seatsLeft > 0 ? `${seatsLeft} seats left` : 'Sold out'}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
