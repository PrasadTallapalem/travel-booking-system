import { Link } from 'react-router-dom';
import { rupees } from '../api';

const FALLBACK = 'https://placehold.co/600x400/0F2A3D/EAF2F1?text=Wayfare';

export default function PackageCard({ pkg }) {
  return (
    <Link to={`/packages/${pkg._id}`} className="card">
      <div className="card-img">
        <img src={pkg.image || FALLBACK} alt={pkg.title} loading="lazy"
             onError={(e) => { e.currentTarget.src = FALLBACK; }} />
        <span className="tag">{pkg.category}</span>
        {pkg.seats <= 5 && pkg.seats > 0 && <span className="tag warn">Only {pkg.seats} seats left</span>}
        {pkg.seats === 0 && <span className="tag warn">Sold out</span>}
      </div>
      <div className="card-body">
        <h3>{pkg.title}</h3>
        <p className="muted">{pkg.destination}, {pkg.country} · {pkg.days} days · ★ {pkg.rating}</p>
        <p className="price">{rupees(pkg.price)} <small>per person</small></p>
      </div>
    </Link>
  );
}
