import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const fmtDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export default function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seats, setSeats] = useState(1);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const handleBook = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setBooking(true);
    setError('');
    setMessage('');
    try {
      await api.post('/bookings', { eventId: id, seats });
      setMessage('You are booked! Check "My Bookings" for details.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="page-loading">Loading event…</div>;
  if (!event) return <div className="empty-state container">Event not found.</div>;

  const seatsLeft = event.capacity - (event.bookedCount || 0);
  const soldOut = seatsLeft <= 0;
  const cancelled = event.status === 'cancelled';

  return (
    <div className="container">
      <div className="details-layout">
        <div>
          <div className="details-media">{event.imageUrl && <img src={event.imageUrl} alt={event.title} />}</div>
          <span className="eyebrow">{event.category?.name || 'General'}</span>
          <h1>{event.title}</h1>
          <p style={{ color: '#6B6357', marginTop: 10, lineHeight: 1.6 }}>{event.description}</p>

          <div className="details-info-grid">
            <div className="info-block">
              <div className="label">Date</div>
              <div className="value">{fmtDate(event.date)}</div>
            </div>
            <div className="info-block">
              <div className="label">Time</div>
              <div className="value">{event.time || 'TBA'}</div>
            </div>
            <div className="info-block">
              <div className="label">Location</div>
              <div className="value">{event.location}</div>
            </div>
            <div className="info-block">
              <div className="label">Capacity</div>
              <div className="value">{event.capacity} seats</div>
            </div>
          </div>
        </div>

        <div className="booking-card">
          <div className="price-large">{event.price > 0 ? `₹${event.price}` : 'Free'}</div>
          <p style={{ color: '#6B6357', fontSize: 13, margin: '4px 0 18px' }}>
            {soldOut ? 'This event is sold out' : `${seatsLeft} of ${event.capacity} seats available`}
          </p>

          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-success">{message}</div>}

          {!cancelled && !soldOut && (
            <div className="field">
              <label>Seats</label>
              <input
                type="number"
                min={1}
                max={Math.max(seatsLeft, 1)}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </div>
          )}

          <button
            className="btn btn-coral btn-block"
            disabled={booking || soldOut || cancelled}
            onClick={handleBook}
          >
            {cancelled ? 'Event cancelled' : soldOut ? 'Sold out' : booking ? 'Booking…' : 'Book now'}
          </button>

          {!user && <p style={{ fontSize: 12, color: '#918A7B', marginTop: 10 }}>You'll be asked to log in first.</p>}

          <div style={{ marginTop: 16 }}>
            <Link to="/" style={{ fontSize: 13, color: 'var(--teal-deep)', fontWeight: 600 }}>
              ← Back to all events
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
