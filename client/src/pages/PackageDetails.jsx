import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, fmtDate, rupees } from '../api';
import { useAuth } from '../context/AuthContext';

const FALLBACK = 'https://placehold.co/1000x500/0F2A3D/EAF2F1?text=Wayfare';

export default function PackageDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pkg, setPkg] = useState(null);
  const [error, setError] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(null);

  useEffect(() => {
    api.get(`/packages/${id}`)
      .then((r) => { setPkg(r.data); setTravelDate(r.data.startDates?.[0] || ''); })
      .catch((e) => setError(errMsg(e)));
  }, [id]);

  if (error) return <p className="alert center-note">{error}</p>;
  if (!pkg) return <p className="center-note">Loading…</p>;

  const total = pkg.price * travelers;
  const maxTravelers = Math.min(10, pkg.seats);

  const book = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login', { state: { from: `/packages/${id}` } });
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/bookings', { packageId: id, travelDate, travelers, paymentMethod });
      setConfirmed(data);
      setPkg({ ...pkg, seats: pkg.seats - travelers });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (confirmed) {
    return (
      <section className="section narrow">
        <div className="ticket">
          <div className="ticket-main">
            <p className="muted">Booking confirmed</p>
            <h2>{pkg.title}</h2>
            <p>{pkg.destination}, {pkg.country}</p>
            <dl>
              <div><dt>Departs</dt><dd>{fmtDate(confirmed.travelDate)}</dd></div>
              <div><dt>Travelers</dt><dd>{confirmed.travelers}</dd></div>
              <div><dt>Paid</dt><dd>{rupees(confirmed.totalPrice)}</dd></div>
            </dl>
          </div>
          <div className="ticket-stub">
            <p className="muted">Reference</p>
            <strong>{confirmed.reference}</strong>
          </div>
        </div>
        <div className="row-actions">
          <button className="btn" onClick={() => navigate('/my-bookings')}>View my bookings</button>
          <button className="btn ghost" onClick={() => navigate('/packages')}>Browse more trips</button>
        </div>
      </section>
    );
  }

  return (
    <section className="section details">
      <div className="details-main">
        <img className="details-img" src={pkg.image || FALLBACK} alt={pkg.title}
             onError={(e) => { e.currentTarget.src = FALLBACK; }} />
        <h1>{pkg.title}</h1>
        <p className="muted">{pkg.destination}, {pkg.country} · {pkg.days} days · {pkg.category} · ★ {pkg.rating}</p>
        <p>{pkg.description}</p>
        {pkg.highlights?.length > 0 && (
          <>
            <h3>What's included</h3>
            <ul className="highlights">{pkg.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
          </>
        )}
      </div>

      <form className="book-box" onSubmit={book}>
        <p className="price big">{rupees(pkg.price)} <small>per person</small></p>

        {pkg.seats === 0 ? (
          <p className="alert">This trip is sold out.</p>
        ) : (
          <>
            <label>
              Departure date
              <select value={travelDate} onChange={(e) => setTravelDate(e.target.value)} required>
                {pkg.startDates.map((d) => <option key={d} value={d}>{fmtDate(d)}</option>)}
              </select>
            </label>
            <label>
              Travelers ({pkg.seats} seats left)
              <input type="number" min="1" max={maxTravelers} value={travelers}
                     onChange={(e) => setTravelers(Math.max(1, Math.min(maxTravelers, Number(e.target.value) || 1)))} />
            </label>
            <label>
              Pay with
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="card">Credit / debit card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net banking</option>
              </select>
            </label>
            <div className="total"><span>Total</span><strong>{rupees(total)}</strong></div>
            {error && <p className="alert">{error}</p>}
            <button className="btn sun wide" disabled={busy}>
              {busy ? 'Booking…' : user ? 'Pay and book' : 'Log in to book'}
            </button>
            <p className="muted small">Demo project: payment is simulated, no money is charged.</p>
          </>
        )}
      </form>
    </section>
  );
}
