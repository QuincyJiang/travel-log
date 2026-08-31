import { Link, useLocation } from "wouter";

export default function SiteHeader({ trip }) {
  const [location] = useLocation();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="行旅志首页">
        <span className="brand-mark">行</span>
        <span>
          <b>行旅志</b>
          <small>TRAVEL LOG</small>
        </span>
      </Link>
      <nav className="pill-nav" aria-label="主导航">
        <Link className={location === "/" ? "active" : ""} href="/">旅程</Link>
        {trip && <Link className={location.startsWith(`/trips/${trip.id}`) ? "active" : ""} href={`/trips/${trip.id}`}>当前行程</Link>}
      </nav>
    </header>
  );
}
