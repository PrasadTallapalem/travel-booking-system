import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, fmtDate, rupees } from '../api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    api.get('/bookings/mine')
      .then((r) => setBookings(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const cancel = async (id) => {
    if (!window.confirm('Cancel this booking? Your payment will be refunded.')) return;
    try {
      await api.put(`/bookings/${id}/cancel`);
      load();
    } catch (e) {
      setError(errMsg(e));
    }
  };

  if (loading) return <p className="center-note">Loading your bookings…</p>;

  return (
    <section className="section narrow">
      <h2>My bookings</h2>
      {error && <p className="alert">{error}</p>}
      {bookings.length === 0 && (
        <p className="center-note">You haven't booked anything yet. <Link to="/packages">Browse packages</Link></p>
      )}
      {bookings.map((b) => (
        <div key={b._id} className={`ticket ${b.status === 'cancelled' ? 'cancelled' : ''}`}>
          <div className="ticket-main">
            <p className="muted">{b.status === 'cancelled' ? 'Cancelled · refunded' : 'Confirmed'}</p>
            <h3>{b.package?.title || 'Package removed'}</h3>
            <p>{b.package?.destination}</p>
            <dl>
              <div><dt>Departs</dt><dd>{fmtDate(b.travelDate)}</dd></div>
              <div><dt>Travelers</dt><dd>{b.travelers}</dd></div>
              <div><dt>Total</dt><dd>{rupees(b.totalPrice)}</dd></div>
            </dl>
            {b.status === 'confirmed' && (
              <button className="btn danger small-btn" onClick={() => cancel(b._id)}>Cancel booking</button>
            )}
          </div>
          <div className="ticket-stub">
            <p className="muted">Reference</p>
            <strong>{b.reference}</strong>
          </div>
        </div>
      ))}
    </section>
  );
}
