import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import PackageCard from '../components/PackageCard';

const CATEGORIES = ['Beach', 'Mountain', 'City', 'Heritage', 'Adventure', 'Wildlife'];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/packages', { params: { featured: true } }).then((r) => setFeatured(r.data)).catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const q = new URLSearchParams();
    if (search) q.set('search', search);
    if (category !== 'All') q.set('category', category);
    navigate(`/packages?${q}`);
  };

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1>Pick a place.<br />We'll hold your seat.</h1>
          <p>Fixed-price trips with confirmed departure dates. Book in a minute, cancel from your account.</p>
          <form className="search-strip" onSubmit={submit}>
            <label>
              Where to?
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Goa, Bali, Leh…" />
            </label>
            <label>
              Trip type
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option>All</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <button className="btn sun">Find trips</button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Popular this season</h2>
          <button className="btn ghost" onClick={() => navigate('/packages')}>See all packages</button>
        </div>
        <div className="grid">
          {featured.map((p) => <PackageCard key={p._id} pkg={p} />)}
        </div>
        {featured.length === 0 && (
          <p className="center-note">No packages yet. Run <code>npm run seed</code> in the server folder.</p>
        )}
      </section>
    </>
  );
}
