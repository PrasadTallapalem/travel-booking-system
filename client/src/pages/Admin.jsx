import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate, rupees } from '../api';

const EMPTY = {
  title: '', destination: '', country: '', description: '', image: '',
  price: '', days: '', seats: '', category: 'City', highlights: '', featured: false,
};
const CATEGORIES = ['Beach', 'Mountain', 'City', 'Heritage', 'Adventure', 'Wildlife'];

export default function Admin() {
  const [tab, setTab] = useState('packages');
  const [stats, setStats] = useState(null);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const loadAll = () => {
    api.get('/bookings/admin/stats').then((r) => setStats(r.data)).catch((e) => setError(errMsg(e)));
    api.get('/packages').then((r) => setPackages(r.data));
    api.get('/bookings').then((r) => setBookings(r.data));
  };
  useEffect(loadAll, []);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    const body = {
      ...form,
      price: Number(form.price),
      days: Number(form.days),
      seats: Number(form.seats),
      highlights: form.highlights.split(',').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (editingId) {
        await api.put(`/packages/${editingId}`, body);
      } else {
        // New packages get 4 monthly departure dates starting 2 weeks from now
        body.startDates = Array.from({ length: 4 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() + 14 + i * 30); d.setHours(0, 0, 0, 0); return d;
        });
        await api.post('/packages', body);
      }
      setForm(EMPTY);
      setEditingId(null);
      loadAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({ ...p, highlights: (p.highlights || []).join(', ') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this package?')) return;
    await api.delete(`/packages/${id}`);
    loadAll();
  };

  const cancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking and refund the traveler?')) return;
    try { await api.put(`/bookings/${id}/cancel`); loadAll(); } catch (e) { setError(errMsg(e)); }
  };

  return (
    <section className="section">
      <h2>Admin dashboard</h2>
      {stats && (
        <div className="stats">
          <div><strong>{stats.users}</strong><span>Users</span></div>
          <div><strong>{stats.packages}</strong><span>Packages</span></div>
          <div><strong>{stats.bookings}</strong><span>Active bookings</span></div>
          <div><strong>{rupees(stats.revenue)}</strong><span>Revenue</span></div>
        </div>
      )}
      {error && <p className="alert">{error}</p>}

      <div className="tabs">
        <button className={tab === 'packages' ? 'on' : ''} onClick={() => setTab('packages')}>Packages</button>
        <button className={tab === 'bookings' ? 'on' : ''} onClick={() => setTab('bookings')}>All bookings</button>
      </div>

      {tab === 'packages' && (
        <>
          <form className="admin-form" onSubmit={save}>
            <h3>{editingId ? 'Edit package' : 'Add a package'}</h3>
            <div className="form-grid">
              <label>Title<input required value={form.title} onChange={set('title')} /></label>
              <label>Destination<input required value={form.destination} onChange={set('destination')} /></label>
              <label>Country<input required value={form.country} onChange={set('country')} /></label>
              <label>Category
                <select value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label>Price per person (₹)<input type="number" min="0" required value={form.price} onChange={set('price')} /></label>
              <label>Days<input type="number" min="1" required value={form.days} onChange={set('days')} /></label>
              <label>Seats available<input type="number" min="0" required value={form.seats} onChange={set('seats')} /></label>
              <label>Image URL<input value={form.image} onChange={set('image')} /></label>
            </div>
            <label>Description<textarea required rows="3" value={form.description} onChange={set('description')} /></label>
            <label>Highlights (comma separated)<input value={form.highlights} onChange={set('highlights')} /></label>
            <label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Show on home page</label>
            <div className="row-actions">
              <button className="btn">{editingId ? 'Save changes' : 'Add package'}</button>
              {editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(EMPTY); }}>Cancel edit</button>}
            </div>
          </form>

          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Destination</th><th>Price</th><th>Seats</th><th></th></tr></thead>
              <tbody>
                {packages.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td><td>{p.destination}</td><td>{rupees(p.price)}</td><td>{p.seats}</td>
                    <td className="actions">
                      <button className="link" onClick={() => edit(p)}>Edit</button>
                      <button className="link danger" onClick={() => remove(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ref</th><th>Traveler</th><th>Package</th><th>Departs</th><th>Pax</th><th>Total</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td>{b.reference}</td>
                  <td>{b.user?.name}<br /><small className="muted">{b.user?.email}</small></td>
                  <td>{b.package?.title}</td>
                  <td>{fmtDate(b.travelDate)}</td>
                  <td>{b.travelers}</td>
                  <td>{rupees(b.totalPrice)}</td>
                  <td>{b.status}</td>
                  <td>{b.status === 'confirmed' && <button className="link danger" onClick={() => cancelBooking(b._id)}>Cancel</button>}</td>
                </tr>
              ))}
              {bookings.length === 0 && <tr><td colSpan="8" className="center-note">No bookings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
