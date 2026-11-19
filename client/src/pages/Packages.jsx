import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import PackageCard from '../components/PackageCard';

const CATEGORIES = ['All', 'Beach', 'Mountain', 'City', 'Heritage', 'Adventure', 'Wildlife'];

export default function Packages() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || 'All',
    maxPrice: '',
    sort: 'default',
  });
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  // Re-fetch (debounced) whenever a filter changes
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .get('/packages', { params: { ...filters, sort: filters.sort === 'default' ? undefined : filters.sort } })
        .then((r) => { setPackages(r.data); setError(''); })
        .catch((e) => setError(errMsg(e)))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [filters]);

  return (
    <section className="section">
      <h2>Find your trip</h2>
      <div className="filters">
        <input placeholder="Search destination or country" value={filters.search} onChange={set('search')} />
        <select value={filters.category} onChange={set('category')}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={filters.maxPrice} onChange={set('maxPrice')}>
          <option value="">Any budget</option>
          <option value="15000">Up to ₹15,000</option>
          <option value="30000">Up to ₹30,000</option>
          <option value="60000">Up to ₹60,000</option>
          <option value="100000">Up to ₹1,00,000</option>
        </select>
        <select value={filters.sort} onChange={set('sort')}>
          <option value="default">Recommended</option>
          <option value="priceAsc">Price: low to high</option>
          <option value="priceDesc">Price: high to low</option>
          <option value="rating">Top rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {error && <p className="alert">{error}</p>}
      {loading ? (
        <p className="center-note">Loading packages…</p>
      ) : packages.length === 0 ? (
        <p className="center-note">No trips match these filters. Try a wider budget or a different trip type.</p>
      ) : (
        <div className="grid">{packages.map((p) => <PackageCard key={p._id} pkg={p} />)}</div>
      )}
    </section>
  );
}
