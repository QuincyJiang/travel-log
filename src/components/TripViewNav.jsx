import { Link, useLocation } from "wouter";

export default function TripViewNav({ trip }) {
  const [location] = useLocation();
  const photosPath = `/photos/${trip.id}`;
  const isPhotos = location === photosPath;

  return (
    <nav className="trip-view-nav" aria-label={`${trip.shortTitle}内容`}>
      <Link className={!isPhotos ? "active" : ""} href={`/trips/${trip.id}`}>
        行程攻略
      </Link>
      <Link className={isPhotos ? "active" : ""} href={photosPath}>
        影像相册
      </Link>
    </nav>
  );
}
